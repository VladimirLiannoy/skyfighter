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

var PATH_MAX_LENGTH = 2400;
var TRAPS_MAX_COUNT = 4;

var graviTraps = [/*{"x": 500, "y": 500, size: 250}*/];

var routes = [
    [{"x": 107, "y": 61}, {"x": 189, "y": 71}, {"x": 265, "y": 92}, {"x": 356, "y": 100}, {
        "x": 470,
        "y": 81
    }, {"x": 558, "y": 66}, {"x": 705, "y": 98}, {"x": 831, "y": 137}, {"x": 957, "y": 195}, {
        "x": 1030,
        "y": 268
    }, {"x": 1075, "y": 309}, {"x": 1192, "y": 345}, {"x": 1289, "y": 387}, {"x": 1380, "y": 462}, {
        "x": 1424,
        "y": 543
    }, {"x": 1513, "y": 662}, {"x": 1593, "y": 736}, {"x": 1678, "y": 860}, {"x": 1725, "y": 939}, {
        "x": 1818,
        "y": 1065
    }],
    [{"x": 108, "y": 71}, {"x": 178, "y": 97}, {"x": 291, "y": 117}, {"x": 392, "y": 118}, {
        "x": 542,
        "y": 105
    }, {"x": 667, "y": 121}, {"x": 759, "y": 152}, {"x": 866, "y": 192}, {"x": 959, "y": 239}, {
        "x": 1045,
        "y": 386
    }, {"x": 1147, "y": 534}, {"x": 1161, "y": 638}, {"x": 1162, "y": 773}, {"x": 1210, "y": 851}, {
        "x": 1291,
        "y": 922
    }, {"x": 1369, "y": 1006}, {"x": 1548, "y": 1099}, {"x": 1679, "y": 1143}, {"x": 1802, "y": 1134}],
    [{"x": 107, "y": 79}, {"x": 218, "y": 135}, {"x": 305, "y": 192}, {"x": 361, "y": 288}, {
        "x": 438,
        "y": 380
    }, {"x": 501, "y": 485}, {"x": 690, "y": 559}, {"x": 792, "y": 658}, {"x": 857, "y": 712}, {
        "x": 1030,
        "y": 768
    }, {"x": 1163, "y": 807}, {"x": 1398, "y": 789}, {"x": 1535, "y": 784}, {"x": 1589, "y": 796}, {
        "x": 1662,
        "y": 881
    }, {"x": 1721, "y": 988}, {"x": 1799, "y": 1075}],
    [{"x": 105, "y": 92}, {"x": 272, "y": 181}, {"x": 343, "y": 275}, {"x": 490, "y": 493}, {
        "x": 647,
        "y": 571
    }, {"x": 767, "y": 883}, {"x": 1029, "y": 1001}, {"x": 1237, "y": 1110}, {"x": 1450, "y": 1107}, {
        "x": 1667,
        "y": 1163
    }, {"x": 1779, "y": 1148}],
    [{"x": 101, "y": 86}, {"x": 309, "y": 394}, {"x": 347, "y": 528}, {"x": 358, "y": 674}, {
        "x": 416,
        "y": 761
    }, {"x": 688, "y": 910}, {"x": 881, "y": 969}, {"x": 1063, "y": 951}, {"x": 1132, "y": 964}, {
        "x": 1231,
        "y": 968
    }, {"x": 1370, "y": 1035}, {"x": 1469, "y": 1091}, {"x": 1660, "y": 1088}, {"x": 1773, "y": 1088}],
    [{"x": 84, "y": 86}, {"x": 227, "y": 320}, {"x": 312, "y": 540}, {"x": 340, "y": 707}, {
        "x": 435,
        "y": 801
    }, {"x": 550, "y": 874}, {"x": 714, "y": 958}, {"x": 888, "y": 999}, {"x": 1019, "y": 1071}, {
        "x": 1155,
        "y": 1137
    }, {"x": 1272, "y": 1152}, {"x": 1385, "y": 1150}, {"x": 1501, "y": 1143}, {"x": 1610, "y": 1164}, {
        "x": 1686,
        "y": 1188
    }, {"x": 1784, "y": 1172}]

];


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
};*/

document.getElementById("addPlayer").addEventListener("click", function () {
    var rawData = document.getElementById("playerData").value,
        data = JSON.parse(rawData);

    PROFILES.push(data);
});

document.getElementById("startGame").addEventListener("click", function () {

    function processResponse(response) {
        PROFILES = response;

        var rockets = [],
            rocket1,
            rocket2,
            rocket3,
            rocket4,
            rocket5,
            rocket6;


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

    serverManager.getAllPlayersConfig(processResponse);

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