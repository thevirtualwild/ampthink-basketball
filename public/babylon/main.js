// Main Controller Code
var socket = io();

var canvas = document.getElementById("canvas");
var attractLabel = document.getElementById("attractLabel");
var scoreLabel = document.getElementById("scoreLabel");

var engine = new BABYLON.Engine(canvas, true);
var useCannon = false;

var gameStates = Object.freeze({"ATTRACT": 0, "WAITING": 1, "GAMEPLAY": 2, "RESULTS": 3});
var currentGameState = gameStates.ATTRACT;

var cameraNames = Object.freeze({"freeThrow": 0, "quarterFar": 1, "close": 2});
var selectedCameraType = cameraNames.freeThrow;

var netSpheres = [];

var cameraSettings = [];
var score = 0;
var initWaitTime = 7;
var currentWaitTime = 7;
var initGameTime = 30;
var currentGameTime = 30;
var initResultsTime = 10;
var currentResultsTime = 10;
createCameraTypes();

var currentCameraIndex = 0;
var currentTextureIndex = 0;

var prevAnimation;

var createScene = function(){
    var scene = new BABYLON.Scene(engine);
    engine.enableOfflineSupport = false;

    var initCameraPos;
    var initCameraFocus;

    if(useCannon) {
        var physicsPlugin = new BABYLON.CannonJSPlugin(true, 5);
        //physicsPlugin.setTimeStep(1/100);
    }
    else
    {
        var physicsPlugin = new BABYLON.OimoJSPlugin(1);
        //physicsPlugin.setTimeStep(1/100);
        physicsPlugin.allowSleep = true;
    }

    var gravityVector = new BABYLON.Vector3(0,-15.81, 0);
    scene.enablePhysics(gravityVector, physicsPlugin);
    scene.getPhysicsEngine().setTimeStep(1/45);
    scene.getPhysicsEngine().getPhysicsPlugin().world.allowSleep = true;
    var camera = new BABYLON.FreeCamera("camera1", initCameraPos, scene);
    //camera.setTarget(initCameraFocus);

    camera.attachControl(canvas, true);

    camera.position = cameraSettings[currentCameraIndex].initPos;
    camera.setTarget(cameraSettings[currentCameraIndex].initFocus);

    changeGameState(gameStates.ATTRACT);

    function changeGameState(gameState)
    {
        switch(gameState)
        {
            case gameStates.ATTRACT:
                currentGameState = gameState;
                currentCameraIndex = 0;
                animateCamera();
                updateUI();
                break;
            case gameStates.WAITING:
                currentGameState = gameState;
                currentCameraIndex = 1;
                animateCamera();
                updateUI();
                break;
            case gameStates.GAMEPLAY:
                currentGameState = gameState;
                currentCameraIndex = 1;
                updateUI();
                break;
            case gameStates.RESULTS:
                currentGameState = gameState;
                currentCameraIndex = 1;
                updateUI();
                break;
            default:
                currentGameState = gameStates.ATTRACT;
        }
    }

    function animateCamera()
    {
        var initPosition;
        var finalPosition;

        if(currentGameState == gameStates.ATTRACT)
        {
            initPosition = camera.position;

            finalPosition = new BABYLON.Vector3(
                cameraSettings[currentCameraIndex].initPos.x,
                cameraSettings[currentCameraIndex].initPos.y,
                cameraSettings[currentCameraIndex].initPos.z);

            if(initPosition.y == finalPosition.y)
            finalPosition.x = -initPosition.x;

            var keys = [];
            keys.push({
                    frame: 0,
                    value: initPosition});
            keys.push(
                {frame: 300,
                    value: finalPosition});

            var dataType = BABYLON.Animation.ANIMATIONTYPE_VECTOR3;
            var animation = new BABYLON.Animation("attractAnimation", "position", 30, dataType, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

            var ease = new BABYLON.QuadraticEase();
            ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
            animation.setKeys(keys);
            animation.setEasingFunction(ease);
            camera.animations = [];
            camera.animations.push(animation);
            scene.beginAnimation(camera, 0, 300, false, 1, animateCamera);
            //prevAnimation = scene.beginAnimation(camera, 0, 600, false, 1, animateCamera);
            //prevAnimation = animation;
        }
        else if(currentGameState == gameStates.WAITING)
        {
            initPosition = camera.position;
            finalPosition = cameraSettings[currentCameraIndex].initPos;

            var keys = [];
            keys.push({
                frame: 0,
                value: initPosition});
            keys.push(
                {frame: 240,
                    value: finalPosition});

            var dataType = BABYLON.Animation.ANIMATIONTYPE_VECTOR3;
            var animation = new BABYLON.Animation("freeThrowAnimation", "position", 240, dataType, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

            var ease = new BABYLON.QuadraticEase();
            ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
            animation.setKeys(keys);
            animation.setEasingFunction(ease);
            camera.animations = [];
            camera.animations.push(animation);
            scene.beginAnimation(camera, 0, 600, false, 1);
        }
    }

    scene.registerBeforeRender(function()
    {
        camera.setTarget(torus.position);

        if(currentGameState == gameStates.WAITING)
        {
            currentWaitTime -= (engine.getDeltaTime() / 1000);
            attractLabel.innerHTML = currentWaitTime.toFixed(2) + "<br /> WAITING FOR PLAYERS";

            if(currentWaitTime <= 0)
            {
                changeGameState(gameStates.GAMEPLAY);
            }
        }
        else if(currentGameState == gameStates.GAMEPLAY)
        {
            currentGameTime -= (engine.getDeltaTime() / 1000);
            attractLabel.innerHTML = currentGameTime.toFixed(2);

            if(currentGameTime <= 0)
            {
                changeGameState(gameStates.RESULTS);
            }
        }
        else if(currentGameState == gameStates.RESULTS)
        {
            currentResultsTime -= (engine.getDeltaTime() / 1000);
            attractLabel.innerHTML = "Score: " + score;
            if(currentResultsTime <= 0)
            {
                changeGameState(gameStates.ATTRACT);
            }
        }

    });

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

    light.intensity = 0.7;

    var basketball = BABYLON.Mesh.CreateSphere("basketball", 16, 1.88, scene);


    BABYLON.SceneLoader.ImportMesh("BASKET_BALL", "./assets/", "basketball3dtest.babylon", scene, function (mesh) {

        mesh[0].scaling = new BABYLON.Vector3(0.05, 0.05, 0.05);

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        var cellMaterial = new BABYLON.CellMaterial("test", scene);
        myMaterial.diffuseTexture = new BABYLON.Texture("./assets/basketball3dtestdiffuse.jpg", scene);
        cellMaterial.diffuseTexture = new BABYLON.Texture("./assets/basketball3dtestdiffuse.jpg", scene);
        //myMaterial.bumpTexture = new BABYLON.Texture("./assets/basketball3dtestbump.jpg", scene);
        mesh[0].material = myMaterial;
        //mesh[0].material = cellMaterial;

        basketball.physicsImpostor = new BABYLON.PhysicsImpostor(basketball, BABYLON.PhysicsImpostor.SphereImpostor, {
            mass: 1,
            friction:0.1,
            ignoreParent: true});
        basketball.position = new BABYLON.Vector3(0, 0, 0);

        scene.registerBeforeRender(function()
        {
            //mesh[0].parent = basketball;
            //mesh[0].visible = false;
            if(basketball.position.y < -25)
            {
                if(currentGameState == gameStates.ATTRACT) {
                    takeShot();
                }
            }
        });
    });

    BABYLON.SceneLoader.ImportMesh("", "./assets/", "Goal.babylon", scene, function (meshes) {

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
        var mesh;

        //console.log(i);
        //console.log(meshes[i].name);

        for(var i = 0; i < meshes.length; i++)
        {

            if(meshes[i].name != "Net_Shell_01" &&
                meshes[i].name != "Net_Shell_02" &&
                meshes[i].name != "Net_Shell_03" &&
                meshes[i].name != "Goal_BackboardFill" &&
                meshes[i].name != "Net_Skinned" &&
                meshes[i].name != "Goal_Col_01" &&
                meshes[i].name != "Goal_Col_02" &&
                meshes[i].name != "Ground" &&
                meshes[i].name != "Net_Static" &&
                meshes[i].name != "Hoop" &&
                meshes[i].name != "Gofal" )
            {

                //myMaterial.diffuseTexture = new BABYLON.Texture("./assets/basketball_hoop_diffuse_noAO.jpg", scene);
                //myMaterial.bumpTexture = new BABYLON.Texture("./assets/basketball3dtestbump.tga", scene);
                meshes[i].position = new BABYLON.Vector3(0, -36.1, 17);
                //meshes[i].scaling = new BABYLON.Vector3(0.025, 0.02, 0.025);
                //meshes[i].rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.WORLD);
            }
            else
            {
                scene.meshes.pop(meshes[i]);
            }

        }
    });

    BABYLON.SceneLoader.ImportMesh("", "./assets/", "Seating_Low.babylon", scene, function (meshes) {

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
        var mesh;

        for(var i = 0; i < meshes.length; i++)
        {

            if(meshes[i].name != "Net_Shell_01" &&
                meshes[i].name != "Net_Shell_02" &&
                meshes[i].name != "Net_Shell_03" &&
                meshes[i].name != "Goal_BackboardFill" &&
                meshes[i].name != "Net_Skinned" &&
                meshes[i].name != "Goal_Col_01" &&
                meshes[i].name != "Goal_Col_02" &&
                meshes[i].name != "Ground" &&
                meshes[i].name != "Net_Static" &&
                meshes[i].name != "Ref" &&
                meshes[i].name != "Floor" )
            {

                //myMaterial.diffuseTexture = new BABYLON.Texture("./assets/basketball_hoop_diffuse_noAO.jpg", scene);
                //myMaterial.bumpTexture = new BABYLON.Texture("./assets/basketball3dtestbump.tga", scene);
                meshes[i].position = new BABYLON.Vector3(50, -32, 50);
                console.log(meshes[i].name);
                //meshes[i].scaling = new BABYLON.Vector3(0.025, 0.02, 0.025);
                //meshes[i].rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.WORLD);
            }
            else
            {
                scene.meshes.pop(meshes[i]);
            }
        }
    });

    var torus = BABYLON.Mesh.CreateTorus("torus", 4.3, 0.2, 50, scene);
    torus.position = new BABYLON.Vector3(0, -4.75, 8.9);
    scene.meshes.pop(torus);

    //CREATE CIRCLE OF SPHERE COLLIDERS
    var sphereAmount = 30;
    var radius = 2.15;
    var sphereDiameter = 0.35;
    var centerPos = torus.position;
    for(var i = 0; i < sphereAmount; i++)
    {
        var sphere = BABYLON.Mesh.CreateSphere("sphere", 10, sphereDiameter, scene);
        sphere.position = new BABYLON.Vector3(
            centerPos.x + Math.sin(i*Math.PI * 2/sphereAmount) * radius,
            centerPos.y + 0,
            centerPos.z + Math.cos(i*Math.PI * 2/sphereAmount) * radius
        );

        //scene.meshes.pop(sphere);
        sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, {mass: 0,
            friction: 1,
            restitution: .8} )
        scene.meshes.pop(sphere);
    }

    //CREATE BACKBOARD COLLIDER
    var backboard = BABYLON.Mesh.CreateBox("backboard", 1 , scene);

    backboard.position = new BABYLON.Vector3(0, -2.6, 11.75);
    backboard.scaling = new BABYLON.Vector3(16.3, 7.3, 1);
    backboard.physicsImpostor = new BABYLON.PhysicsImpostor(backboard, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0,
    friction: 1,
    restitution: .8} )
    scene.meshes.pop(backboard);

    //CREATE COLLIDERS FOR NET
    var sphereAmount = 10;
    var radius = 2.15;
    var sphereDiameter = 0.25;
    var centerPos = torus.position;
    centerPos.y -= 4;
    var height = 4;
    for(var j = 0; j < height; j++)
    {
        for (var i = 0; i < sphereAmount; i++)
        {
            var sphere = BABYLON.Mesh.CreateSphere("sphere", 10, sphereDiameter, scene);
            sphere.position = new BABYLON.Vector3(
                centerPos.x + Math.sin(i * Math.PI * 2 / sphereAmount) * radius * (1- (j/2/height)),
                centerPos.y + height - j,
                centerPos.z + Math.cos(i * Math.PI * 2 / sphereAmount) * radius * (1- (j/2/height))
            );

            var currentMass = 50.01;
            if(j == 0)//top row
            {
                currentMass = 0;
            }
            //scene.meshes.pop(sphere);
            sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, {
                mass: currentMass

            })
            scene.meshes.pop(sphere);
            sphere.physicsImpostor.sleep();
            netSpheres.push(sphere);
        }
    }

    netSpheres.forEach(function(point, idx) {
        if (idx >= sphereAmount)
        {

            createJoint(point.physicsImpostor, netSpheres[idx - sphereAmount].physicsImpostor, 1);
            var horiDistance = .4*3 - .165* Math.floor(idx/sphereAmount);
            if (idx % sphereAmount > 0)
            {
                createJoint(point.physicsImpostor, netSpheres[idx - 1].physicsImpostor, horiDistance);
            }
            else if(idx % sphereAmount == 0)
            {
                createJoint(point.physicsImpostor, netSpheres[idx + sphereAmount - 1].physicsImpostor, horiDistance);
            }
        }

        scene.meshes.pop(netSpheres[i]);
    });

    var scoreTrigger = new BABYLON.Mesh.CreateBox("scoreTrigger", 0.8, scene);
    scoreTrigger.position = torus.position;
    scoreTrigger.position.y += 2;
    var clearMat = new BABYLON.StandardMaterial("myMaterial", scene);
    clearMat.alpha = 0;
    scoreTrigger.material = clearMat;
    //scene.meshes.pop(scoreTrigger);
    var score = 0;
    var manager = new BABYLON.ActionManager(scene);
    scoreTrigger.actionManager = manager;

    scoreTrigger.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            {
                trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
                parameter: basketball
            },
            function(){
                addScore();
            }
        )
    );

    var clothMat = new BABYLON.StandardMaterial("netMat", scene);
    //var testMat = new BABYLON.standr
    clothMat.diffuseTexture = new BABYLON.Texture("./assets/netTest.png", scene);
    //clothMat.diffuseTexture.vOffset = 0.;
    clothMat.diffuseTexture.vScale = 3;
    clothMat.diffuseTexture.uScale = 2;
    clothMat.backFaceCulling = false;
    clothMat.diffuseTexture.hasAlpha = true;

    var net = BABYLON.Mesh.CreateGround("ground1", 1, 1, sphereAmount, scene, true);
    var positions = net.getVerticesData(BABYLON.VertexBuffer.PositionKind);

    net.material = clothMat;

    var indices = net.getIndices();
    //524
    indices.splice(182, indices.length);

    net.setIndices(indices, indices.length);

    var debugPos = [];
    net.registerBeforeRender(function ()
    {
        var positions = [];

        netSpheres.forEach(function (s, idx)
        {
            positions.push(netSpheres[idx].position.x, netSpheres[idx].position.y, netSpheres[idx].position.z);

            if((idx % sphereAmount) == (sphereAmount - 1))
            {
                positions.push(netSpheres[idx - sphereAmount + 1].position.x, netSpheres[idx - sphereAmount + 1].position.y, netSpheres[idx - sphereAmount + 1].position.z);
            }
        });

        net.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
        net.refreshBoundingInfo();
    });

    scene.actionManager = new BABYLON.ActionManager(scene);

    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            {
                trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                additionalData: 'r'
            },

            function ()
            {
                if(currentGameState == gameStates.GAMEPLAY) {
                    takeShot();
                }
            }
        )
    );

    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            {
                trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                additionalData: 't'
            },

            function () {
                changeCamera();
            }
        )
    );

    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            {
                trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                additionalData: 'u'
            },

            function () {
                changeGameState(gameStates.WAITING);
            }
        )
    );

    function createJoint(imp1, imp2, distance) {
        var joint = new BABYLON.DistanceJoint({
            maxDistance: distance
        })
        imp1.addJoint(imp2, joint);
    }

    function takeShot()
    {
        if(basketball.physicsImpostor) {
            basketball.position = new BABYLON.Vector3(0, -10, -30);

            basketball.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
            basketball.physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
            basketball.physicsImpostor.applyImpulse(new BABYLON.Vector3(randomRange(-.4, .4), randomRange(21, 23), randomRange(15, 17)), basketball.getAbsolutePosition());
        }
    }

    function changeCamera()
    {
        currentCameraIndex++;
    }

    return scene;
}

var scene = createScene();

engine.runRenderLoop(function(){
    scene.render();
    var fpsLabel = document.getElementById("fpsLabel");
    fpsLabel.innerHTML = engine.getFps().toFixed()+ " fps";
});

var $window = $(window);
var $pages = $('.pages'); // Input for roomname
var $passcodeInput = $('.passcodeInput'); // Input for roomname
var shotInfo;
var dragging = false;
var thrown = true;
var countdownStarted = true;

$passcodeInput.focus();

joinRoom();

function joinRoom()
{
    $pages.fadeOut();
    // Tell the server your new room to connect to
    //socket.emit('room', roomname);
    //socket.emit('add user', jsonstring);
}

function randomRange (min, max)
{
    var number = (Math.random() * (min - max) + max);
    //console.log(number);
    return number;
}

socket.on('take shot', function() {

    //var trigger = scene.actionManager.actions[0].trigger;
    var ae = BABYLON.ActionEvent.CreateNewFromScene(scene, {additionalData: "r"});
    //console.log(ae);
    scene.actionManager.processTrigger(scene.actionManager.actions[0].trigger,  ae);

    //console.log(scene.actionManager.actions.length);
});

socket.on('switch camera', function() {
    scene.actionManager.processTrigger(scene.actionManager.actions[1].trigger, {additionalData: "t"});
});

socket.on('join room', function() {
    scene.actionManager.processTrigger(scene.actionManager.actions[2].trigger, {additionalData: "y"});
});

function shotAttempt()
{
    /* data = {
          xval: basketball.x
        }
    */
    //socket.emit('shot attempt', data);
    socket.emit("throw ball", shotInfo);

    resetBall();
}

function canShoot()
{
    thrown = false;
}

socket.on('shot sent', function() {
  // console.log('We got a message back!');
})

function addScore()
{
    if(currentGameState != gameStates.GAMEPLAY && currentGameState != gameStates.GAMEPLAY) return;
    console.log("SCORE ADDED");
    score++;
    var scoreLabel = document.getElementById("scoreLabel");
    scoreLabel.innerHTML = "Score: " + score;
}

function updateUI()
{
    switch(currentGameState)
    {
        case gameStates.ATTRACT:
            scoreLabel.innerHTML = "";
            attractLabel.innerHTML = "BASKETBALL <br /> JOIN GAME";
            break;
        case gameStates.WAITING:
            scoreLabel.innerHTML = "";
            attractLabel.innerHTML = initWaitTime.toString();
            currentWaitTime = initWaitTime;
            break;
        case gameStates.GAMEPLAY:
            scoreLabel.innerHTML = "Score: " + score;
            attractLabel.innerHTML = initGameTime.toString();
            currentGameTime = initGameTime;
            break;
        case gameStates.RESULTS:
            scoreLabel.innerHTML = "";
            attractLabel.innerHTML = "Score: " + score;
            currentResultsTime = initResultsTime;
            break;
        default:
            attractLabel.innerHTML = "";
            scoreLabel.innerHTML = "";
    }
}

function createCameraTypes()
{
    var cameraType = {
        cameraNames: cameraNames.quarterFar,
        initPos: new BABYLON.Vector3(35, 5, -25),
        //initPos: new BABYLON.Vector3(0, 5, -10),
        initFocus: new BABYLON.Vector3(0, -2.6, 11.75)
    }
    cameraSettings.push(cameraType);

    var cameraType = {
        cameraNames: cameraNames.freeThrow,
        initPos: new BABYLON.Vector3(0, -15, -40),
        initFocus: new BABYLON.Vector3(0, -12, 11.75),
    }
    cameraSettings.push(cameraType);

    var cameraType = {
        cameraNames: cameraNames.close,
        initPos: new BABYLON.Vector3(-1, -6, -1),
        initFocus: new BABYLON.Vector3(0, -2.6, 11.75),
    }
    cameraSettings.push(cameraType);
}
