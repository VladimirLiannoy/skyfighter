var app = new PIXI.Application(1920, 1200);
document.getElementById("game").appendChild(app.view);

app.stage.addChild(PIXI.Sprite.fromImage('img/background.jpg'));

var blackHolesCont = new PIXI.Container();
var rocketsCont = new PIXI.Container();
var cloudsCont = new PIXI.Container();
var meteoritsCont = new PIXI.Container();

var explosionSound = new Audio('sounds/explosion.mp3');
var ambient = new Audio('sounds/game-ambient.mp3');

app.stage.addChild(blackHolesCont);
app.stage.addChild(rocketsCont);
app.stage.addChild(cloudsCont);
app.stage.addChild(meteoritsCont);

ambient.loop = true;
ambient.volume = 0.2;
ambient.play();

var PROFILES = [];
//var points = [];
var meteorits = [];
var rockets = [];

var PATH_MAX_LENGTH = 2400;
var TRAPS_MAX_COUNT = 4;

var graviTraps = [/*{"x": 500, "y": 500, size: 250}*/];

var startArea = {
    x: 50,
    y: 40,
    radius: 200
};

var finishArea = {
    x: 1850,
    y: 1140,
    radius: 180
};

app.ticker.add(function () {
    if (Math.random() < 0.3) {
        createMeteorite(meteoritsCont);
    }
});

function createMeteorite(parentContainer) {
    var meteorite = PIXI.Sprite.fromImage('img/meteorite.png'),
        size = parseInt(Math.random() * 30 + 10),
        x = 800 + parseInt(Math.random() * 1920),
        y = -parseInt(Math.random() * 200),
        direction = PIXI.DEG_TO_RAD * 135,
        speed = Math.random() * 5 * (1-size/60) + 3;

    meteorite.position.set(x, y);
    meteorite.anchor.set(0.5);

    var update = function () {
        var newX, newY;

        newX = meteorite.x + Math.cos(direction) * speed;
        newY = meteorite.y + Math.sin(direction) * speed;

        meteorite.position.set(newX, newY);
        meteorite.rotation += 0.01 * speed;

        if (newY > 1300) {
            meteorits = meteorits.filter(function (m) {
                return m !== meteorite;
            });
            app.ticker.remove(update);
            meteorite.destroy();
        }
    };

    app.ticker.add(update);

    meteorite.height = size;
    meteorite.width = size;

    meteorits.push(meteorite);
    parentContainer.addChild(meteorite);
}

function SkyFighter(name, parentContainer, route, traps) {
    var container = new PIXI.Container(),
        title = new PIXI.Text(name, {fontSize: "20px", fill: 0xFFFFFF});

    var rocket = PIXI.Sprite.fromImage('img/rocket.png');
    rocket.anchor.set(0.5);
    rocket.scale.set(0.3);

    parentContainer.addChild(container);
    container.addChild(rocket);
    container.addChild(title);

    title.position.set(0, 50);
    title.anchor.set(0.5);

    container.position.set(route[0].x, route[0].y);

    this.nextPositionIndex = 1;
    this.nextPosition = route[this.nextPositionIndex];

    this.speed = 2;
    this.direction = 0;
    this.isInGravitationTrap = false;
    this.gravitationTrapCount = 0;


    this.flying = true;
    this.shouldMove = true;
    this.shouldPlaySound = true;

    this.update = function () {
        var me = this;

        if (!me.flying) {
            return;
        }

        me.direction = calcDirection(container, me.nextPosition);

        rocket.rotation = me.direction + PIXI.DEG_TO_RAD * 90;

        me.isInGravitationTrap = false;
        me.gravitationTrapCount = 0;

        traps.forEach(function (trap) {
            if (calcDistance(container, trap) < trap.size) {
                me.isInGravitationTrap = true;
                me.gravitationTrapCount++;
            }
        });


        me.makeStep();


        if (calcDistance(container, finishArea) < finishArea.radius) {
            me.flying = false;
            console.error("Winner", name);
        }

        if (calcDistance(container, me.nextPosition) < me.speed) {
            me.nextPositionIndex++;
            me.nextPosition = route[me.nextPositionIndex];
        }
    };


    this.makeStep = function () {
        var me = this,
            speed = me.isInGravitationTrap ? me.speed / (me.gravitationTrapCount + 1) : me.speed,
            collision,
            newX, newY;



        newX = container.x + Math.cos(me.direction) * speed;
        newY = container.y + Math.sin(me.direction) * speed;
        collision = checkCollision(rocket, newX, newY);

        if(checkRocketOverlap(rocket, newX, newY)){
            rocket.position.x += 10;
        }

        if (collision.status) {
            me.shouldMove = false;
            if(me.shouldPlaySound){
                explosionSound.play();
                me.shouldPlaySound = false;
                rocket.tint = 0xFF0000;
            }

            setTimeout(function () {
                me.shouldMove = true;
                me.shouldPlaySound = true;
                rocket.tint = 0xFFFFFF;
            }, collision.meteoriteSize * 100);
        }

        if (me.shouldMove) {
            container.position.set(newX, newY);
        }

        return speed;
    };
}

function checkCollision(rocket, x, y) {
    var isCollision = false,
        combinedHalfWidths, combinedHalfHeights,
        vx, vy, size;

    meteorits.forEach(function (meteorite) {
        meteorite.halfWidth = meteorite.width / 2;
        meteorite.halfHeight = meteorite.height / 2;
        rocket.halfWidth = rocket.width / 2;
        rocket.halfHeight = rocket.height / 2;

        meteorite.CenterX = meteorite.x + meteorite.halfWidth;
        rocket.CenterX = x + rocket.halfWidth;
        meteorite.CenterY = meteorite.y + meteorite.halfHeight;
        rocket.CenterY = y + rocket.halfHeight;

        vx = meteorite.CenterX - rocket.CenterX;
        vy = meteorite.CenterY - rocket.CenterY;

        combinedHalfWidths = meteorite.halfWidth + rocket.halfWidth;
        combinedHalfHeights = meteorite.halfHeight + rocket.halfHeight;

        if (Math.abs(vx) < combinedHalfWidths) {
            if (Math.abs(vy) < combinedHalfHeights) {
                isCollision = true;
                size = meteorite.width;
            }
        }

    });

    return {status: isCollision, meteoriteSize: size};
}

function checkRocketOverlap(rocket, x, y) {
    var isCollision = false,
        combinedHalfWidths, combinedHalfHeights,
        vx, vy;

    rockets.forEach(function (rocket2) {
        rocket2.halfWidth = rocket2.width / 2;
        rocket2.halfHeight = rocket2.height / 2;
        rocket.halfWidth = rocket.width / 2;
        rocket.halfHeight = rocket.height / 2;

        rocket2.CenterX = rocket2.x + rocket2.halfWidth;
        rocket.CenterX = x + rocket.halfWidth;
        rocket2.CenterY = rocket2.y + rocket2.halfHeight;
        rocket.CenterY = y + rocket.halfHeight;

        vx = rocket2.CenterX - rocket.CenterX;
        vy = rocket2.CenterY - rocket.CenterY;

        combinedHalfWidths = rocket2.halfWidth + rocket.halfWidth;
        combinedHalfHeights = rocket2.halfHeight + rocket.halfHeight;

        if (Math.abs(vx) < combinedHalfWidths) {
            if (Math.abs(vy) < combinedHalfHeights) {
                isCollision = true;
            }
        }

    });

    return isCollision;
}

function calcDirection(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

function calcDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2));
}

function drawGraviTrap(x, y, size, parentContainer) {
    var blackhole = PIXI.Sprite.fromImage('img/blackhole-icon.png');

    blackhole.position.set(x, y);
    blackhole.anchor.set(0.5);

    app.ticker.add(function () {
        blackhole.rotation += 0.01;
    });

    blackhole.height = size * 2;
    blackhole.width = size * 2;

    parentContainer.addChild(blackhole);
}

/*function drawRoute(routePoints, parentContainer) {
    var gr = new PIXI.Graphics();

    gr.lineStyle(5, 0xFF0000);

    routePoints.forEach(function (points, i) {
        if (i == 0) {
            gr.moveTo(points.x, points.y);
        } else {
            gr.lineTo(points.x, points.y);
        }
    });

    //var sprite = new PIXI.Sprite(gr.generateTexture(2));
    parentContainer.addChild(gr);
}

function createGrid(parentContainer) {
    var gr = new PIXI.Graphics(),
        step = 20;

    gr.lineStyle(1, 0xFFCC33);

    for (var j = 0; j < 150; j++) {
        gr.moveTo(step * j, 0.5).lineTo(step * j, 2000.5);
        gr.moveTo(0.5, step * j).lineTo(2000.5, step * j);
    }

    var sprite = new PIXI.Sprite(gr.generateTexture(2));

    sprite.interactive = true;
    sprite.buttonMode = true;

    sprite.on("mousedown", function (event) {
        console.log(event);
        points.push({
            x: parseInt(event.data.global.x),
            y: parseInt(event.data.global.y)
        });

        drawGraviTrap(parseInt(event.data.global.x), parseInt(event.data.global.y), 50, blackHolesCont);

        console.log(JSON.stringify(points));
    });


    parentContainer.addChild(sprite);
};

document.getElementById("addPlayer").addEventListener("click", function () {
    var rawData = document.getElementById("playerData").value,
        data = JSON.parse(rawData);

    PROFILES.push(data);
});
*/

document.getElementById("startGame").addEventListener("click", function () {

    function processResponse(response) {
        PROFILES = response;

        /*        var rockets = [],
                    rocket1,
                    rocket2,
                    rocket3,
                    rocket4,
                    rocket5,
                    rocket6;*/


        PROFILES.forEach(function (profile) {
            if(!profile.traps || !(profile.traps instanceof Array) || profile.traps.length > TRAPS_MAX_COUNT){
                console.error("CHEAT ATTEMPT", profile.name);
                return;
            }
            graviTraps = graviTraps.concat(profile.traps);
        });


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

        function isValidPath(path){
            return getPathLength(path) < PATH_MAX_LENGTH && (calcDistance(startArea, path[0]) < startArea.radius)
        }


        PROFILES.forEach(function (profile) {
            if(!isValidPath(profile.path)){
                console.error("CHEAT ATTEMPT", profile.name);
                return;
            }

            rockets.push(new SkyFighter(profile.name, rocketsCont, profile.path, graviTraps));
        });

        graviTraps.forEach(function (graviTrap) {
            drawGraviTrap(graviTrap.x, graviTrap.y, graviTrap.size, blackHolesCont);
        });

        /*        rocket1 = new SkyFighter("Vova", rocketsCont, routes[0], graviTraps);
                rocket2 = new SkyFighter("Vova1", rocketsCont, routes[1], graviTraps);
                rocket3 = new SkyFighter("Vova2", rocketsCont, routes[2], graviTraps);
                rocket4 = new SkyFighter("Vova3", rocketsCont, routes[3], graviTraps);
                rocket5 = new SkyFighter("Vova4", rocketsCont, routes[4], graviTraps);
                rocket6 = new SkyFighter("Kateryna", rocketsCont, routes[5], graviTraps);

                rockets.push(rocket1);
                rockets.push(rocket2);
                rockets.push(rocket3);
                rockets.push(rocket4);
                rockets.push(rocket5);
                rockets.push(rocket6);*/

        app.ticker.add(function (delta) {

            rockets.forEach(function (rocket) {
                rocket.update();
            });
        });
    }


    var pass = prompt("PASSWORD: ", "");
    if(pass === "letTheBattleBegin"){
        serverManager.getAllPlayersConfig(processResponse);
    } else {
        alert("WRONG!");
    }

});

function createCloud(i) {
    var cloud = PIXI.Sprite.fromImage('img/fog' + (i % 8) + '.png'),
        scale = Math.random() * (4 - 1) + 1,
        speed = Math.random() * (0.3 - 0.05) + 0.05;

    cloud.scale.set(scale);
    cloud.position.set(
        Math.random() * (1980 - cloud.width) + cloud.width,
        Math.random() * (1200 - cloud.height) + cloud.height
    );

    app.ticker.add(function () {
        if (cloud.position.x >= 1200) {
            cloud.position.set(
                -(cloud.width),
                Math.random() * 1200
            );
        }

        cloud.position.x += speed;
    });

    cloudsCont.addChild(cloud);
}

for (var i = 0; i < 20; i++) {
    createCloud(i);
}

/*var profile = {
    name: "VVV",
    path: [{"x": 86, "y": 58}, {"x": 1138, "y": 114}, {"x": 1211, "y": 804}, {"x": 1834, "y": 1115}],
    traps: [{"x": 231, "y": 540, size: 150}, {"x": 842, "y": 373, size: 350}, {
        "x": 849,
        "y": 857,
        size: 150
    }, {"x": 1675, "y": 603, size: 250}]
};

console.log(JSON.stringify(profile));*/