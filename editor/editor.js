var app = new PIXI.Application(1920, 1200);
document.getElementById("game").appendChild(app.view);

app.stage.addChild(PIXI.Sprite.fromImage('../img/background.jpg'));
var pathsImage = PIXI.Sprite.fromImage('../img/Paths.png');
pathsImage.position.set(0, 0);
app.stage.addChild(pathsImage);



var PATH_MAX_LENGTH = 2400;
var TRAPS_MAX_COUNT = 4;


function addCircleSprite(conf, parent) {
    var gr = new PIXI.Graphics();

    gr.lineStyle(5, 0xFF0000);

    gr.drawCircle(conf.x, conf.y, conf.radius);

    //var sprite = new PIXI.Sprite(gr.generateTexture(2));
    parent.addChild(gr);
}


var startArea = {
    x: 100,
    y: 100,
    radius: 200
};

var finishArea = {
    x: 1820,
    y: 1100,
    radius: 200
};


var generatedPath = [];
var generatedTraps = [];


var lastPathPoint = [];


var IM_NONE = 0,
    IM_ADD_PATH_POINT = 1,
    IM_ADD_TRAP = 2;


var inputMode = IM_NONE;


var tempTrap;


var newPointContainer = createNewPointContainer(),
    pathLeftSprite;

var pathContainer, trapsContainer;


function createNewPointContainer() {
    var container = new PIXI.Container(),
        circle = new PIXI.Sprite(),
        redCross = new PIXI.Sprite(),

        gfx = new PIXI.Graphics();


    //draw circle
    gfx.clear();
    gfx.lineStyle(5, 0xFFCC33);
    gfx.drawCircle(0, 0, 10);

    circle.texture = gfx.generateTexture(2);
    circle.anchor.set(0.5);


    //draw red cross
    gfx.clear();
    gfx.lineStyle(5, 0xFF0000);
    gfx.moveTo(-10, -10);
    gfx.lineTo(+10, +10);

    gfx.moveTo(+10, -10);
    gfx.lineTo(-10, +10);

    redCross.texture = gfx.generateTexture(2);
    redCross.anchor.set(0.5);


    container.addChild(circle);
    container.addChild(redCross);

    return container;
}


function createPathLeftSprite() {
    var pathLeftSprite = new PIXI.Sprite(),
        gfx = new PIXI.Graphics();


    gfx.lineStyle(5, 0xAABBCC);
    gfx.drawCircle(0, 0, PATH_MAX_LENGTH - getPathLength(generatedPath));


    pathLeftSprite.texture = gfx.generateTexture(2);
    pathLeftSprite.anchor.set(0.5);

    return pathLeftSprite;
}

function getLineLength(p1, p2) {
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
}


function getPathLength(path) {
    var i,
        resLength = 0,
        prevPoint,
        currPoint;

    if (path.length < 2) {
        return 0;
    }


    prevPoint = path[0];
    for (i = 1; i < path.length; i++) {
        currPoint = path[i];

        resLength += getLineLength(prevPoint, currPoint);

        prevPoint = currPoint;
    }


    return resLength;
}


addCircleSprite(startArea, app.stage);
addCircleSprite(finishArea, app.stage);


function createTrapSprite(size) {
    var blackhole = PIXI.Sprite.fromImage('../img/blackhole-icon.png');

    blackhole.position.set(0, 0);
    blackhole.anchor.set(0.5);


    //this creates a memory leak
    app.ticker.add(function () {
        blackhole.rotation += 0.01;
    });


    // blackhole.scale.set(size/blackhole.width);

    return blackhole;
}

function initTrapSprite(x, y, size, parent) {
    var blackhole = createTrapSprite(size);

    blackhole.position.set(x, y);

    parent.addChild(blackhole);
}


function reInitTraps() {
    if (trapsContainer) {
        app.stage.removeChild(trapsContainer);
    }

    trapsContainer = new PIXI.Container();


    for (var i = 0; i < generatedTraps.length; i++) {
        var trapConfig = generatedTraps[i];

        initTrapSprite(trapConfig.x, trapConfig.y, trapConfig.size, trapsContainer);
    }


    app.stage.addChild(trapsContainer);
}


function reInitPath() {
    if (pathContainer) {
        app.stage.removeChild(pathContainer);
    }

    if (generatedPath.length === 0) {
        return;
    }

    pathContainer = new PIXI.Container();
    var gr = new PIXI.Graphics();
    gr.lineStyle(5, 0xFFCC33);

    var minX = 99999, minY = 99999;


    var pathPoint = generatedPath[0];
    gr.moveTo(pathPoint.x, pathPoint.y);
    for (var i = 1; i < generatedPath.length; i++) {
        pathPoint = generatedPath[i];
        gr.lineTo(pathPoint.x, pathPoint.y);
    }


    for (var i = 0; i < generatedPath.length; i++) {
        pathPoint = generatedPath[i];
        gr.drawCircle(pathPoint.x, pathPoint.y, 10);

        if(pathPoint.x < minX){
            minX = pathPoint.x;
        }

        if(pathPoint.y < minY){
            minY = pathPoint.y;
        }
    }


    var sprite = new PIXI.Sprite(gr.generateTexture(2));
    sprite.position.set(minX - 10, minY - 10);

    pathContainer.addChild(sprite);
    pathContainer.position.set(0, 0);

    app.stage.addChild(pathContainer);
}


document.getElementById("addTrap").addEventListener("click", function () {

    if(generatedTraps.length >= TRAPS_MAX_COUNT){
        alert("Max 4 traps might be placed.");
        return;
    }

    inputMode = IM_ADD_TRAP;


    tempTrap = createTrapSprite(1.0);
    app.stage.addChild(tempTrap);
});

document.getElementById("removeTrap").addEventListener("click", function () {
    generatedTraps.pop();

    reInitTraps();
});


document.getElementById("addPathPoint").addEventListener("click", function () {
    inputMode = IM_ADD_PATH_POINT;


    if (generatedPath.length > 0) {
        pathLeftSprite = createPathLeftSprite();
        var lastPoint = generatedPath[generatedPath.length - 1];
        pathLeftSprite.position.set(lastPoint.x, lastPoint.y);
        app.stage.addChild(pathLeftSprite);
    }

    app.stage.addChild(newPointContainer);
});

document.getElementById("removePathPoint").addEventListener("click", function () {
    generatedPath.pop();
    app.stage.removeChild(newPointContainer);
    app.stage.removeChild(pathLeftSprite);
    reInitPath();
    inputMode = IM_NONE;
});


document.getElementById("export").addEventListener("click", function () {

    var name = document.getElementById("playerName").value;

    if(name === null || name.length === 0){
        alert("Enter player name!");
        return;
    }

    console.log(
        JSON.stringify({
            name: name,
            path: generatedPath,
            traps: generatedTraps
        })
    );
});


app.view.addEventListener("mousemove", function (e) {
    var mX = e.offsetX,
        mY = e.offsetY;


    switch (inputMode) {
        case IM_ADD_TRAP: {
            tempTrap.position.set(mX, mY);
        }
            break;

        case IM_ADD_PATH_POINT: {
            newPointContainer.position.set(mX, mY);

            var lastPoint = generatedPath[generatedPath.length - 1],
                newPoint = {x: mX, y: mY};


            if (generatedPath.length === 0 && getLineLength(startArea, newPoint) > startArea.radius) {
                newPointContainer.getChildAt(1).visible = true;
            } else if (generatedPath.length > 0 && getLineLength(lastPoint, newPoint) + getPathLength(generatedPath) > PATH_MAX_LENGTH) {
                newPointContainer.getChildAt(1).visible = true;
            } else {
                newPointContainer.getChildAt(1).visible = false;
            }


        }
            break;
    }
});


app.view.addEventListener("keydown", function () {

});

app.view.addEventListener("mousedown", function (e) {
    var mX = e.offsetX,
        mY = e.offsetY;

    switch (inputMode) {
        case IM_ADD_TRAP: {
            generatedTraps.push({
                x: mX,
                y: mY,
                size: 150//assume x and y scales are equal
            });

            app.stage.removeChild(tempTrap);
            tempTrap = null;
            inputMode = IM_NONE;

            reInitTraps(app.stage);
        }
            break;

        case IM_ADD_PATH_POINT: {
            var lastPoint = generatedPath[generatedPath.length - 1];
            var newPoint = {x: mX, y: mY};


            if (generatedPath.length === 0) {
                if (getLineLength(newPoint, startArea) > startArea.radius) {
                    alert("You should start your path in the orbit of Home Planet!");
                    app.stage.removeChild(pathLeftSprite);
                    return;
                }
            } else if (getPathLength(generatedPath) + getLineLength(lastPoint, newPoint) > PATH_MAX_LENGTH) {
                alert("You don't have enough fuel to fly so long! Shorten the trajectory!");
                return;
            }

            generatedPath.push(newPoint);

            app.stage.removeChild(newPointContainer);
            app.stage.removeChild(pathLeftSprite);
            reInitPath();
            inputMode = IM_NONE;
        }
            break;
    }
});


reInitPath();
