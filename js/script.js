window.onload = function() {
    var MarbleMystic = {
        globals: {
            currMarble: null,
            clickedMarbles: [],
            clickedMarbleParents: [],
            jumpMarbles: [], //Useful for undo.
            jumpMarbleParents: [],
            board: document.getElementById('board').innerHTML, //Useful for reset.
            timer: null //Timer
        },
        doms: {
            topCover: document.getElementById('topCover'),
            board: document.getElementById('board'),
            gameStats: document.getElementById('gameStats'),
            playBtn: document.getElementById('playBtn'),
            undoBtn: document.getElementById('undoBtn'),
            resetBtn: document.getElementById('resetBtn'),
            howToBtn: document.getElementById('howToBtn'),
            onModalOkBtn: document.getElementById('onModalOkBtn'),
            gameInfoOkBtn: document.getElementById('gameInfoOkBtn'),
            remMarble: document.getElementById('remMarble'),
            modal: document.getElementById('modal'),
            modalText: document.getElementById('modalText'),
            overlay: document.getElementById('overlay'),
            gameInfo: document.getElementById('gameInfo'),
            time: document.getElementById("time")
        },
        events: {
            'onPlayBtnClick': function() {
                MarbleMystic.doms.topCover.style.display = "none";
                MarbleMystic.doms.board.style.display = "block";
                MarbleMystic.doms.gameStats.style.visibility = "visible";
                MarbleMystic.doms.playBtn.style.display = "none";
                MarbleMystic.doms.undoBtn.style.display = "inline-block";
                MarbleMystic.doms.resetBtn.style.display = "inline-block";
                MarbleMystic.startTimer();
            },
            'onDivClick': function(event) { /*Removes the current clicked Marble and places on clicked div,also removes jumped Marble.*/
                var currDiv = event.target,
                    jumpMarbleParent;
                if (event.target.tagName == 'IMG') {
                    MarbleMystic.onMarbleClick(event.target);
                } else {
                    if (currDiv.style.backgroundPosition == "-70px 0px" && MarbleMystic.globals.currMarble != null) {
                        //Removing jumped Marble if Marble is coming from left
                        if ((currDiv.id - MarbleMystic.globals.currMarble.parentNode.id) === 2) {
                            jumpMarbleParent = document.getElementById(currDiv.id - 1 + '');
                            MarbleMystic.globals.jumpMarbles.push(jumpMarbleParent.removeChild(jumpMarbleParent.children[0]));
                            MarbleMystic.globals.jumpMarbleParents.push(jumpMarbleParent);
                        }
                        //Removing jumped Marble if Marble is coming from right
                        if ((currDiv.id - MarbleMystic.globals.currMarble.parentNode.id) === -2) {
                            jumpMarbleParent = document.getElementById(parseInt(currDiv.id) + 1 + '');
                            MarbleMystic.globals.jumpMarbles.push(jumpMarbleParent.removeChild(jumpMarbleParent.children[0]));
                            MarbleMystic.globals.jumpMarbleParents.push(jumpMarbleParent);
                        }
                        //Removing jumped Marble if Marble is coming from top
                        if ((currDiv.id - MarbleMystic.globals.currMarble.parentNode.id) === 20) {
                            jumpMarbleParent = document.getElementById(currDiv.id - 10 + '');
                            MarbleMystic.globals.jumpMarbles.push(jumpMarbleParent.removeChild(jumpMarbleParent.children[0]));
                            MarbleMystic.globals.jumpMarbleParents.push(jumpMarbleParent);
                        }
                        //Removing jumped Marble if Marble is coming from down
                        if ((currDiv.id - MarbleMystic.globals.currMarble.parentNode.id) === -20) {
                            jumpMarbleParent = document.getElementById(parseInt(currDiv.id) + 10 + '');
                            MarbleMystic.globals.jumpMarbles.push(jumpMarbleParent.removeChild(jumpMarbleParent.children[0]));
                            MarbleMystic.globals.jumpMarbleParents.push(jumpMarbleParent);
                        }
                        MarbleMystic.globals.clickedMarbles.push(MarbleMystic.globals.currMarble);
                        MarbleMystic.globals.clickedMarbleParents.push(MarbleMystic.globals.currMarble.parentNode);
                        MarbleMystic.globals.currMarble.parentNode.removeChild(MarbleMystic.globals.currMarble); /*removing current Marble*/
                        currDiv.appendChild(MarbleMystic.globals.currMarble); /*appending removed Marble to newly moved div*/
                        MarbleMystic.resetBoardBg(); //To reset background after moving marble.
                        if (!MarbleMystic.hasValidMoves()) {
                            if (document.getElementsByTagName('img').length != 4) {
                                clearInterval(MarbleMystic.globals.timer);
                                MarbleMystic.modalPopup('Hurray! No More Valid Moves Possible, Try Again!');
                            }
                        }
                        MarbleMystic.gameStatus();
                    }
                }
            },
            'onUndoBtnClick': function() { /*Performs one step undo on undo button click*/
                var currMarble, clickedMarbleParent, jumpMarbleParent, jumpMarble;
                if (MarbleMystic.globals.clickedMarbles.length != 0 && MarbleMystic.globals.clickedMarbleParents.length != 0 && MarbleMystic.globals.jumpMarbles.length != 0) {
                    currMarble = MarbleMystic.globals.clickedMarbles.pop();
                    clickedMarbleParent = MarbleMystic.globals.clickedMarbleParents.pop();
                    jumpMarbleParent = MarbleMystic.globals.jumpMarbleParents.pop();
                    jumpMarble = MarbleMystic.globals.jumpMarbles.pop();
                    currMarble = currMarble.parentNode.removeChild(currMarble);
                    clickedMarbleParent.appendChild(currMarble);
                    jumpMarbleParent.appendChild(jumpMarble);
                    MarbleMystic.resetBoardBg();
                    MarbleMystic.doms.remMarble.innerHTML = parseInt(MarbleMystic.doms.remMarble.innerHTML) + 1;
                }
            },
            'onHowToBtnClick': function() {
                MarbleMystic.doms.overlay.style.display = "block";
                MarbleMystic.doms.gameInfo.style.display = "block";
                MarbleMystic.doms.gameInfo.style.top = (window.innerHeight / 2 - gameInfo.offsetHeight / 2) + "px";
                MarbleMystic.doms.gameInfo.style.left = (window.innerWidth / 2 - gameInfo.offsetWidth / 2) + "px";
            },
            'gameInfoOkBtnClick': function() {
                MarbleMystic.doms.gameInfo.style.display = "none";
                MarbleMystic.doms.overlay.style.display = "none";
            },
            'onModalOkBtnClick': function() {
                MarbleMystic.doms.overlay.style.display = "none";
                MarbleMystic.doms.modal.style.display = "none";
                MarbleMystic.resetGame();
            }
        },
        init: function() {
            var offset;
            offset = window.innerHeight - document.getElementById('wrapper').offsetHeight;
            document.getElementById('wrapper').style.margin = offset / 2 + "px" + " auto"; //to vertical align wrapper div
            if (window.addEventListener) {
                this.doms.playBtn.addEventListener('click', this.events.onPlayBtnClick);
                this.doms.undoBtn.addEventListener('click', this.events.onUndoBtnClick);
                this.doms.resetBtn.addEventListener('click', this.resetGame);
                this.doms.howToBtn.addEventListener('click', this.events.onHowToBtnClick);
                this.doms.onModalOkBtn.addEventListener('click', this.events.onModalOkBtnClick);
                this.doms.gameInfoOkBtn.addEventListener('click', this.events.gameInfoOkBtnClick);
            } else if (window.attachEvent) {
                this.doms.playBtn.attachEvent('onclick', this.onPlayBtnClick());
                this.doms.undoBtn.attachEvent('onclick', this.onUndoBtnClick());
                this.doms.resetBtn.attachEvent('onclick', this.resetGame());
                this.doms.howToBtn.attachEvent('onclick', this.events.onHowToBtnClick());
                this.doms.onModalOkBtn.attachEvent('onclick', this.events.onModalOkBtnClick());
                this.doms.gameInfoOkBtn.attachEvent('onclick', this.events.gameInfoOkBtnClick());
            }
            this.registerBoardEvents();
        },
        registerBoardEvents: function() {
            var boardElements = document.getElementById('board').childNodes;
            for (var i = boardElements.length - 1; i >= 0; i--) {
                if (boardElements[i].className == 'giveBg') {
                    if (window.addEventListener) {
                        boardElements[i].addEventListener('click', this.events.onDivClick);
                    } else if (window.attachEvent) {
                        boardElements[i].attachEvent('onclick', this.events.onDivClick);
                    }
                }
            }
        },
        startTimer: function() {
            var hour = 0,
                min = 0,
                sec = 0;

            function countDown() {
                if (sec == 60) {
                    sec = 0;
                    min++;
                }
                if (min == 60) {
                    min = 0;
                    hour++;
                }
                MarbleMystic.doms.time.innerHTML = (hour < 10 ? '0' + hour : hour) + ":" +
                    (min < 10 ? '0' + min : min) + ":" + (sec < 10 ? '0' + sec : sec);
                sec++;
            }
            MarbleMystic.globals.timer = setInterval(countDown, 1000);
        },
        onMarbleClick: function(marble) { /*Checks valid moves and gives different bg to indicate possible moves*/
            var parentDivId = parseInt(marble.parentNode.id), //clicked Marble img parent id.
                checkDivIds = [], //surrounding div ids to be checked for valid moves.
                hasValidMove = false;

            checkDivIds = [parentDivId + 2 + '', parentDivId + 20 + '', parentDivId - 2 + '', parentDivId - 20 + ''];
            this.resetBoardBg(); //Resets board (when several clicks are made on diff Marbles and no Marble is moved.)

            //To check right move
            if (document.getElementById(checkDivIds[0]) != null && !document.getElementById(checkDivIds[0]).hasChildNodes() && document.getElementById(checkDivIds[0]).className === 'giveBg') {
                if (document.getElementById(parentDivId + 1 + '').hasChildNodes()) {
                    document.getElementById(checkDivIds[0]).style.backgroundPosition = "-70px 0px";
                    hasValidMove = true;
                }
            }
            //To check down move
            if (document.getElementById(checkDivIds[1]) != null && !document.getElementById(checkDivIds[1]).hasChildNodes() && document.getElementById(checkDivIds[1]).className === 'giveBg') {
                if (document.getElementById(parentDivId + 10 + '').hasChildNodes()) {
                    document.getElementById(checkDivIds[1]).style.backgroundPosition = "-70px 0px";
                    hasValidMove = true;
                }
            }
            //To check left move
            if (document.getElementById(checkDivIds[2]) != null && !document.getElementById(checkDivIds[2]).hasChildNodes() && document.getElementById(checkDivIds[2]).className === 'giveBg') {
                if (document.getElementById(parentDivId - 1 + '').hasChildNodes()) {
                    document.getElementById(checkDivIds[2]).style.backgroundPosition = "-70px 0px";
                    hasValidMove = true;
                }
            }
            //To check top move
            if (document.getElementById(checkDivIds[3]) != null && !document.getElementById(checkDivIds[3]).hasChildNodes() && document.getElementById(checkDivIds[3]).className === 'giveBg') {
                if (document.getElementById(parentDivId - 10 + '').hasChildNodes()) {
                    document.getElementById(checkDivIds[3]).style.backgroundPosition = "-70px 0px";
                    hasValidMove = true;
                }
            }
            if (hasValidMove) {
                this.globals.currMarble = marble;
            }
        },
        resetBoardBg: function() {
            var board = MarbleMystic.doms.board;
            for (var i = board.childNodes.length - 1; i >= 0; i--) {
                if (board.childNodes[i].nodeName !== '#text' && board.childNodes[i].style.backgroundPosition == "-70px 0px") {
                    board.childNodes[i].style.backgroundPosition = "0px 0px";
                }
            }
        },
        gameStatus: function() { //To check number of Marbles and update the same, also to check finish status.
            var imgTags = document.getElementsByTagName('img').length;
            MarbleMystic.doms.remMarble.innerHTML = imgTags - 4;
            if (imgTags == 4) {
                clearInterval(MarbleMystic.globals.timer);
                MarbleMystic.modalPopup('Congrats! You Took Time: <span style="color:red">' + document.getElementById('time').innerHTML + '</span> To Solve The Puzzle ');
            }
        },
        hasValidMoves: function() { //Checks if there is valid move and returns true or flase accordingly.
            var imgNodes = document.getElementsByTagName('img');
            var parentDivId, checkDivIds = []; //surrounding div ids to be checked for valid moves.
            for (var i = imgNodes.length - 1; i >= 0; i--) {
                if (!isNaN(parseInt(imgNodes[i].parentNode.id))) {
                    parentDivId = parseInt(imgNodes[i].parentNode.id);
                    checkDivIds = [parentDivId + 2 + '', parentDivId + 20 + '', parentDivId - 2 + '', parentDivId - 20 + ''];
                    //To check right move
                    if (document.getElementById(checkDivIds[0]) != null && !document.getElementById(checkDivIds[0]).hasChildNodes() && document.getElementById(checkDivIds[0]).className === 'giveBg') {
                        if (document.getElementById(parentDivId + 1 + '').hasChildNodes()) {
                            return true;
                        }
                    }
                    //To check down move
                    if (document.getElementById(checkDivIds[1]) != null && !document.getElementById(checkDivIds[1]).hasChildNodes() && document.getElementById(checkDivIds[1]).className === 'giveBg') {
                        if (document.getElementById(parentDivId + 10 + '').hasChildNodes()) {
                            return true;
                        }
                    }
                    //To check left move
                    if (document.getElementById(checkDivIds[2]) != null && !document.getElementById(checkDivIds[2]).hasChildNodes() && document.getElementById(checkDivIds[2]).className === 'giveBg') {
                        if (document.getElementById(parentDivId - 1 + '').hasChildNodes()) {
                            return true;
                        }
                    }
                    //To check top move
                    if (document.getElementById(checkDivIds[3]) != null && !document.getElementById(checkDivIds[3]).hasChildNodes() && document.getElementById(checkDivIds[3]).className === 'giveBg') {
                        if (document.getElementById(parentDivId - 10 + '').hasChildNodes()) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        resetGame: function() { //Resets the game to start afresh
            MarbleMystic.doms.board.innerHTML = MarbleMystic.globals.board;
            MarbleMystic.registerBoardEvents();
            clearInterval(MarbleMystic.globals.timer);
            document.getElementById('time').innerHTML = "00:00:00";
            MarbleMystic.doms.remMarble.innerHTML = document.getElementsByTagName('img').length - 4;
            MarbleMystic.startTimer();
        },
        modalPopup: function(message) {
            this.doms.overlay.style.display = "block";
            this.doms.modal.style.display = "block";
            this.doms.modalText.innerHTML = message;
            this.doms.modal.style.top = (window.innerHeight / 2 - modal.offsetHeight / 2) + "px";
            this.doms.modal.style.left = (window.innerWidth / 2 - modal.offsetWidth / 2) + "px";
        }
    };
    MarbleMystic.init();
}