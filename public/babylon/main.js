// Main Controller Code
var socket = io();

var canvas = document.getElementById("canvas");
var engine = new BABYLON.Engine(canvas, true);
var useCannon = false;

var gameStates = Object.freeze({"ATTRACT": 0, "WAITING": 1, "GAMEPLAY": 2, "RESULTS": 3});
var currentGameState = gameStates.ATTRACT;

var cameraNames = Object.freeze({"freeThrow": 0, "quarterFar": 1, "close": 2});
var selectedCameraType = cameraNames.freeThrow;

var cameraSettings = [];

createCameraTypes();

var currentCameraIndex = 0;
var currentTextureIndex = 0;

var createScene = function(){
    var scene = new BABYLON.Scene(engine);
    engine.enableOfflineSupport = false;

    var initCameraPos;
    var initCameraFocus;

    if(useCannon) {
        var physicsPlugin = new BABYLON.CannonJSPlugin(true, 5);
        physicsPlugin.setTimeStep(0.1);
    }
    else
    {
        var physicsPlugin = new BABYLON.OimoJSPlugin(1);
        physicsPlugin.allowSleep = true;
    }

    var gravityVector = new BABYLON.Vector3(0,-15.81, 0);
    scene.enablePhysics(gravityVector, physicsPlugin);

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
                break;
            case gameStates.WAITING:
                currentGameState = gameState;
                currentCameraIndex = 1;
                break;
            case gameStates.GAMEPLAY:
                currentGameState = gameState;
                currentCameraIndex = 1;
                break;
            case gameStates.RESULTS:
                currentGameState = gameState;
                currentCameraIndex = 1;
                break;
            default:
                currentGameState = gameStates.ATTRACT;
        }
    }

    function animateCamera()
    {
        //var initPosition = cameraSettings[currentCameraIndex].initPos;
        var initPosition = camera.position;
        var finalPosition = new BABYLON.Vector3(initPosition.x, initPosition.y, initPosition.z);
        finalPosition.x = -finalPosition.x;

       var keys = [{frame: 0,
                   value: initPosition},
                   {frame: 600,
                       value: finalPosition}];
       var dataType = BABYLON.Animation.ANIMATIONTYPE_VECTOR3;
       var animation = new BABYLON.Animation("myTweenedAnimation", "position", 30, dataType, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

       var ease = new BABYLON.QuadraticEase();
       ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
       animation.setKeys(keys);
       animation.setEasingFunction(ease);
       scene.beginDirectAnimation(camera, [animation], 0, 600, false, 1, animateCamera);
    }

    scene.registerBeforeRender(function()
    {
        camera.setTarget(cameraSettings[currentCameraIndex].initFocus);
    });

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

    light.intensity = 0.7;

    var basketball = BABYLON.Mesh.CreateSphere("basketball", 16, 1.88, scene);

    BABYLON.SceneLoader.ImportMesh("BASKET_BALL", "./assets/", "basketball3dtest.babylon", scene, function (mesh) {

        mesh[0].scaling = new BABYLON.Vector3(0.05, 0.05, 0.05);

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        myMaterial.diffuseTexture = new BABYLON.Texture("./assets/basketball3dtestdiffuse.jpg", scene);
        //myMaterial.bumpTexture = new BABYLON.Texture("./assets/basketball3dtestbump.jpg", scene);
        mesh[0].material = myMaterial;

        basketball.physicsImpostor = new BABYLON.PhysicsImpostor(basketball, BABYLON.PhysicsImpostor.SphereImpostor, {
            mass: 1,
            friction:0.1,
            ignoreParent: true});
        basketball.position = new BABYLON.Vector3(0, 10, 10);

        scene.registerBeforeRender(function()
        {
            mesh[0].parent = basketball;
            //mesh[0].visible = false;
            if(basketball.position.y < -15)
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
    var netSpheres = [];
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

            var currentMass = 1.01;
            if(j == 0)//top row
            {
                currentMass = 0;
            }
            //scene.meshes.pop(sphere);
            sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, {
                mass: currentMass

            })
            scene.meshes.pop(sphere);
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

    var clothMat = new BABYLON.StandardMaterial("netMat", scene);
    //var testMat = new BABYLON.standr
    clothMat.diffuseTexture = new BABYLON.Texture("./assets/netTest.png", scene);
    //clothMat.diffuseTexture.vOffset = 0.;
    clothMat.diffuseTexture.vScale = 3;
    clothMat.diffuseTexture.uScale = 2;
    clothMat.backFaceCulling = false;
    clothMat.diffuseTexture.hasAlpha = true;

    var net = BABYLON.Mesh.CreateGround("ground1", 1, 1, sphereAmount - 1, scene, true);
    var positions = net.getVerticesData(BABYLON.VertexBuffer.PositionKind);

    net.material = clothMat;

    var indices = net.getIndices();
    //524
    indices.splice(164, indices.length);

    net.setIndices(indices, indices.length);

    var debugPos = [];
    net.registerBeforeRender(function ()
    {
        var positions = [];

        netSpheres.forEach(function (s, idx)
        {
            //s.position += netSpheres[0].position;
            positions.push(netSpheres[idx].position.x, netSpheres[idx].position.y, netSpheres[idx].position.z);
            //console.log(idx);
            /*
            if((idx % sphereAmount) == (sphereAmount - 1))
            {
                //console.log(idx);
                //console.log(idx - sphereAmount + 1);
                //console.log(s.position);
                //console.log(netSpheres[idx - sphereAmount + 1].position);
                /*
                positions.push(netSpheres[idx - sphereAmount + 1].position.x, netSpheres[idx - sphereAmount + 1].position.y, netSpheres[idx - sphereAmount + 1].position.z);
                //var debugSphere = BABYLON.Mesh.CreateSphere("sphere", 10, 0.1, scene);
                if(debugPos.length < 8)
                {
                    debugPos.push(s.position);
                    var sphere = BABYLON.Mesh.CreateSphere("sphere", 10, 0.2, scene);
                    sphere.position = s.position;
                    var redMat = new BABYLON.StandardMaterial("redMat", scene);
                    redMat.diffuseColor = new BABYLON.Color3(1, 0, 1);
                    sphere.material = redMat;
                    var sphere1 = BABYLON.Mesh.CreateSphere("sphere1", 10, 0.2, scene);
                    sphere1.position = new BABYLON.Vector3(
                        netSpheres[idx - sphereAmount + 1].position.x, netSpheres[idx - sphereAmount + 1].position.y, netSpheres[idx - sphereAmount + 1].position.z);
                }
                */
            //}


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
                console.log("FIRED takeShot()");
                //console.log(parameter);
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
    /*
    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            {
                trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                additionalData: 'y'
            },

            function () {
                loadTexture();
            }
        )
    );
*/
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
/*
    function loadTexture()
    {
        currentTextureIndex++;

        if(currentTextureIndex>9) return;

        var box = BABYLON.Mesh.CreateBox("box" + currentTextureIndex, 1, scene);
        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        box.position = new BABYLON.Vector3(-10 + currentTextureIndex*2, 0, 0);

        myMaterial.diffuseTexture = new BABYLON.Texture("./assets/test" + currentTextureIndex + ".png", scene);
        //myMaterial.bumpTexture = new BABYLON.Texture("./assets/basketball3dtestbump.jpg", scene);
        box.material = myMaterial;
        console.log("load Texture");
    }
*/
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

socket.on('load texture', function() {
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

function createCameraTypes()
{
    var cameraType = {
        cameraNames: cameraNames.quarterFar,
        initPos: new BABYLON.Vector3(50, 5, -25),
        initFocus: new BABYLON.Vector3(0, -2.6, 11.75)
    }
    cameraSettings.push(cameraType);

    var cameraType = {
        cameraNames: cameraNames.freeThrow,
        initPos: new BABYLON.Vector3(0, -15, -40),
        initFocus: new BABYLON.Vector3(0, -8, 11.75),
    }
    cameraSettings.push(cameraType);

    var cameraType = {
        cameraNames: cameraNames.close,
        initPos: new BABYLON.Vector3(-1, -6, -1),
        initFocus: new BABYLON.Vector3(0, -2.6, 11.75),
    }
    cameraSettings.push(cameraType);
}
