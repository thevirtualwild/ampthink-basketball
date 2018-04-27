// Main Controller Code
var socket = io();

var canvas = document.getElementById("canvas");
var attractLabel = document.getElementById("attractLabel");
var scoreLabel = document.getElementById("scoreLabel");

var engine = new BABYLON.Engine(canvas, true, null, false);
var useCannon = false;

var gameStates = Object.freeze({"ATTRACT": 0, "WAITING": 1, "GAMEPLAY": 2, "RESULTS": 3, "INACTIVE": 4});
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
var shotIndex = 0;
createCameraTypes();

var gameReady = false;

var currentCameraIndex = 0;
var currentTextureIndex = 0;

var prevAnimation;

var playerData;



var createScene = function(){
    var scene = new BABYLON.Scene(engine);

    var shotClockTextures = [];

    engine.enableOfflineSupport = false;

    //engine.setHardwareScalingLevel(1.25);

    scene.clearColor = BABYLON.Color3.Black();

    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogStart = 30;
    scene.fogEnd = 100;
    scene.fogColor =  BABYLON.Color3.Black();

    //scene.autoClear = false; // Color buffer
    scene.autoClearDepthAndStencil = false; // Depth and stencil, obviously

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
    scene.getPhysicsEngine().setTimeStep(1/(40 * .6));
    scene.getPhysicsEngine().getPhysicsPlugin().world.allowSleep = true;
    var camera = new BABYLON.FreeCamera("camera1", initCameraPos, scene);

    /*
    var pipeline = new BABYLON.DefaultRenderingPipeline(
        "default", // The name of the pipeline
        true, // Do you want HDR textures ?
        scene, // The scene instance
        [camera] // The list of cameras to be attached to
    );

    /*
        pipeline.bloomEnabled = true;
        pipeline.bloomThreshold = 0.8;
        pipeline.bloomWeight = 0.2;
        pipeline.bloomKernel = 4;
        pipeline.bloomScale = 0.3;
    */

    camera.attachControl(canvas, true);

    camera.position = cameraSettings[currentCameraIndex].initPos;
    camera.setTarget(cameraSettings[currentCameraIndex].initFocus);
    camera.maxZ = 130;
    camera.minZ = 1;

    var shotClockTens =  BABYLON.Mesh.CreatePlane("shotClock", 1.0, scene);
    var shotClockOnes =  BABYLON.Mesh.CreatePlane("shotClock", 1.0, scene);

    shotClockTens.position = new BABYLON.Vector3(-1.3, +3.5, 12);
    shotClockTens.scaling = new BABYLON.Vector3(2.5, 5, .1);

    shotClockOnes.position = new BABYLON.Vector3(1.3, +3.5, 12);
    shotClockOnes.scaling = new BABYLON.Vector3(2.5, 5, .1);

    for(var i = 0; i < 10; i++) {
        var texture = new BABYLON.Texture("./assets/ShotClock/Alphas/Texture" + i + ".png", scene, false, false, 1, function(tex)
        {
            var myMaterialTens = new BABYLON.StandardMaterial("myMaterial", scene);
            var myMaterialOnes = new BABYLON.StandardMaterial("myMaterial", scene);

            //var texture = shotClockTextures[i];
            //shotClockTextures.push(texture);
            console.log(texture.name);


                myMaterialTens.emissiveTexture = texture;
                myMaterialOnes.emissiveTexture = texture;
                myMaterialTens.diffuseTexture = texture;
                myMaterialOnes.diffuseTexture = texture;

                myMaterialTens.emissiveTexture.uScale = 1;
                myMaterialOnes.emissiveTexture.vScale = -1;

                myMaterialTens.backFaceCulling = true;
                myMaterialTens.diffuseTexture.hasAlpha = true;
                myMaterialTens.emissiveTexture.hasAlpha = true;

                myMaterialTens.alphaMode = BABYLON.Engine.ALPHA_ONEONE;

                myMaterialOnes.backFaceCulling = true;
                myMaterialOnes.diffuseTexture.hasAlpha = true;

                shotClockTens.material = myMaterialTens;
                shotClockOnes.material = myMaterialOnes;


        });
    }




    changeGameState(gameStates.ATTRACT);

    function changeGameState(gameState)
    {
        switch(gameState)
        {
            case gameStates.ATTRACT:
                currentGameState = gameState;
                currentCameraIndex = 0;
                gameReady = false;
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
                socket.emit("game over", playerData);
                updateUI();
                break;
            case gameStates.INACTIVE:
                currentGameState = gameState;
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
        var i = 0;

        var newPos = new BABYLON.Vector3(0,0,0);
        newPos.x = torus.position.x + 0;
        newPos.y = torus.position.y + 5;
        newPos.z = torus.position.z - 0;
        camera.setTarget(newPos);
        camera.fov = 1;
        //light.position = camera.position;
        //camera.setTarget(cameraSettings[0].initFocus);

//UPDATE SHOT CLOCK

        if(currentGameState == gameStates.WAITING)
        {
            currentWaitTime -= (engine.getDeltaTime() / 1000);
            if (hasplayer) {
              attractLabel.innerHTML =  currentWaitTime.toFixed(2) + "<br /> WAITING FOR PLAYERS";
            }

            if(currentWaitTime <= 0)
            {
              if (hasplayer) {
                changeGameState(gameStates.GAMEPLAY);
              } else {
                changeGameState(gameStates.INACTIVE);
              }
            }
            else if(currentWaitTime < 2 && !gameReady)
            {
                gameReady = true;
                if (hasplayer) {
                  socket.emit("game almost ready", courtName);
                }
            }
        }
        else if(currentGameState == gameStates.GAMEPLAY)
        {
            currentGameTime -= (engine.getDeltaTime() / 1000);
            var time = currentGameTime.toFixed(2);
            attractLabel.innerHTML =  time;

            /*
            //UPDATE SHOT CLOCK
            var tensTexture = shotClockTextures[ parseInt(time.substr(0,1))];
            var onesTexture = shotClockTextures[ parseInt(time.substr(1,1))];

            //shotClockTens.material.diffuseTexture.alphaMode = BABYLON.material.alphaMode.ALPHA_ADD;
            //shotClockOnes.material.diffuseTexture.alphaMode = BABYLON.material.alphaMode.ALPHA_ADD;

            shotClockTens.material.diffuseTexture = tensTexture;
            shotClockOnes.material.diffuseTexture = onesTexture;
*/
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
                socket.emit('room reset');
            }
        }

    });

    //var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

    //light.intensity = 0;

    var torus = BABYLON.Mesh.CreateTorus("torus", 4.3, 0.2, 50, scene);
    torus.position = new BABYLON.Vector3(0, -4.75, 8.9);
    scene.meshes.pop(torus);

    var basketballs = [];

    var basketball;
    for(var i = 0; i < 10; i++)
    {
        basketball = BABYLON.Mesh.CreateSphere("basketball", 16, 2.5, scene);
        basketball.position = torus.position;
        var newPos = new BABYLON.Vector3(0,0,0);
        newPos.x = basketball.position.x + i*3;
        newPos.y = basketball.position.y - 100;
        newPos.z = basketball.position.z + 5;
        basketball.position = newPos;

        basketball.scaling = new BABYLON.Vector3(1,1,1);
        basketballs.push(basketball);
    }

    BABYLON.SceneLoader.ImportMesh("", "./assets/BBall/", "BBall.babylon", scene, function (mesh) {

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
        myMaterial.emissiveTexture = new BABYLON.Texture("./assets/BBall/BBall_Albedo_Logo.png", scene);
        //myMaterial.diffuseTexture = new BABYLON.Texture("./assets/BBall/BBall_Logo.png", scene);
        //myMaterial.bumpTexture = new BABYLON.Texture("./assets/BBall/BBall_Normal.png", scene);
        //myMaterial.freeze();
        var newBasketballs = [];

        var newBasketball = mesh[0];
        scene.meshes.pop(mesh[0]);

        for (var i= 0; i< basketballs.length; i++)
        {
            basketballs[i].physicsImpostor = new BABYLON.PhysicsImpostor(basketballs[i], BABYLON.PhysicsImpostor.SphereImpostor, {
                mass: 1,
                friction:0.1,
                ignoreParent: true});

            var newBasketball = mesh[0].clone("index: " + i);

            //newBasketball.position.x =+ i*2;
            newBasketball.scaling = new BABYLON.Vector3(1.3, 1.4, 1.3);
            newBasketball.material = myMaterial;

            newBasketballs.push(newBasketball);
        }
        scene.registerBeforeRender(function()
        {
            for(var i = 0 ; i < basketballs.length; i++)
            {
                newBasketballs[i].parent = basketballs[i];
                //newBasketballs[i].position = basketballs[i].position;

                if (basketballs[0].position.y < -45) {
                    if (currentGameState == gameStates.ATTRACT) {
                        shotIndex = 0;
                        takeShot();
                    }
                }
            }

        });
    });

    BABYLON.SceneLoader.ImportMesh("Goal_Backboard", "./assets/Layout/", "Goal.babylon", scene, function (mesh) {

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        var mesh = mesh[0];

        myMaterial.emissiveTexture = new BABYLON.Texture("./assets/Colors.png", scene);

        var newPos = new BABYLON.Vector3(0, 0, 0);
        newPos.x = mesh.position.x + 0;
        newPos.y = mesh.position.y + -35.75;
        newPos.z = mesh.position.z - 60;
        mesh.position = newPos;
        //mesh.scaling = new BABYLON.Vector3(0.8, 1, 1);
        //console.log(meshes[i].name);
        mesh.material = myMaterial;
        mesh.freezeWorldMatrix();

    });

    BABYLON.SceneLoader.ImportMesh("Goal_Rim", "./assets/Layout/", "Goal.babylon", scene, function (mesh) {

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        var mesh = mesh[0];

        myMaterial.emissiveTexture = new BABYLON.Texture("./assets/Colors.png", scene);
        //myMaterial.diffuseTexture = new BABYLON.Texture("./assets/Layout/Layout_Albedo.png", scene);

        //myMaterial.specularPower = 20;
        //myMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        //myMaterial.roughness = 100;
        var newPos = new BABYLON.Vector3(0, 0, 0);
        newPos.x = mesh.position.x + 0;
        newPos.y = mesh.position.y + -35.75;
        newPos.z = mesh.position.z - 70;
        mesh.position = newPos;
        mesh.scaling = new BABYLON.Vector3(1.1, 1, 1.1);
        //console.log(meshes[i].name);
        //myMaterial.emissiveColor = new BABYLON.Color3(1, .2, 0);
        mesh.material = myMaterial;
        mesh.freezeWorldMatrix();

    });

    BABYLON.SceneLoader.ImportMesh("Goal_Base", "./assets/Layout/", "Goal.babylon", scene, function (mesh) {

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        var mesh = mesh[0];

        myMaterial.emissiveTexture = new BABYLON.Texture("./assets/Colors.png", scene);
        //myMaterial.diffuseTexture = new BABYLON.Texture("./assets/Layout/Layout_Albedo.png", scene);

        var newPos = new BABYLON.Vector3(0, 0, 0);
        newPos.x = mesh.position.x + 0;
        newPos.y = mesh.position.y + -35.75;
        newPos.z = mesh.position.z - 60;
        mesh.position = newPos;
        //mesh.scaling = new BABYLON.Vector3(.8, 1, 1.1);
        //console.log(meshes[i].name);
        mesh.material = myMaterial;
        mesh.freezeWorldMatrix();

    });

    BABYLON.SceneLoader.ImportMesh("", "./assets/Layout/", "Seating_Close.babylon", scene, function (meshes) {

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        for (var i = 0; i < meshes.length; i++) {

            if (meshes[i].name != "LightfBeam.004" &&
                meshes[i].name != "Floor") {

                myMaterial.emissiveTexture = new BABYLON.Texture("./assets/Colors.png", scene);
                //myMaterial.diffuseTexture.hasAlpha = true;
                myMaterial.freeze();
                //myMaterial.bumpTexture = new BABYLON.Texture("./assets/Layout/Layout_Normal.png", scene);
                //myMaterial.specularTexture = new BABYLON.Texture("./assets/Layout/Layout_Smoothness.png", scene);

                var newPos = new BABYLON.Vector3(0, 0, 0);
                newPos.x = meshes[i].position.x + 0;
                newPos.y = meshes[i].position.y + -36;
                newPos.z = meshes[i].position.z - 60;
                meshes[i].position = newPos
                console.log(meshes[i].name);
                meshes[i].material = myMaterial;
                meshes[i].freezeWorldMatrix();
            }
            else {
                scene.meshes.pop(meshes[i]);
            }
            console.log(i);
        }
    });

/*
    BABYLON.SceneLoader.ImportMesh("", "./assets/Layout/", "Seating_Far.babylon", scene, function (meshes) {

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        for (var i = 0; i < meshes.length; i++) {

            if (meshes[i].name != "LightfBeam.004" &&
                meshes[i].name != "Floor") {

                myMaterial.diffuseTexture = new BABYLON.Texture("./assets/Layout/Layout_Albedo.png", scene);
                myMaterial.diffuseTexture.hasAlpha = true;
                myMaterial.freeze();
                //myMaterial.bumpTexture = new BABYLON.Texture("./assets/Layout/Layout_Normal.png", scene);
                //myMaterial.specularTexture = new BABYLON.Texture("./assets/Layout/Layout_Smoothness.png", scene);

                var newPos = new BABYLON.Vector3(0, 0, 0);
                newPos.x = meshes[i].position.x + 0;
                newPos.y = meshes[i].position.y + -36;
                newPos.z = meshes[i].position.z - 60;
                meshes[i].position = newPos
                console.log(meshes[i].name);
                meshes[i].material = myMaterial;
                meshes[i].freezeWorldMatrix();
            }
            else {
                scene.meshes.pop(meshes[i]);
            }
            console.log(i);
        }
    });


    BABYLON.SceneLoader.ImportMesh("", "./assets/Layout/", "Layout.babylon", scene, function (meshes) {

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        for (var i = 0; i < meshes.length; i++) {

            if (meshes[i].name != "LightfBeam.004" &&
                meshes[i].name != "Flfdoor") {

                myMaterial.diffuseTexture = new BABYLON.Texture("./assets/Layout/Layout_Albedo.png", scene);
                myMaterial.diffuseTexture.hasAlpha = true;
                myMaterial.freeze();
                //myMaterial.bumpTexture = new BABYLON.Texture("./assets/Layout/Layout_Normal.png", scene);
                //myMaterial.specularTexture = new BABYLON.Texture("./assets/Layout/Layout_Smoothness.png", scene);

                var newPos = new BABYLON.Vector3(0, 0, 0);
                newPos.x = meshes[i].position.x + 0;
                newPos.y = meshes[i].position.y + -36;
                newPos.z = meshes[i].position.z - 60;
                meshes[i].position = newPos
                console.log(meshes[i].name);
                meshes[i].material = myMaterial;
                meshes[i].freezeWorldMatrix();
            }
            else {
                scene.meshes.pop(meshes[i]);
            }
            console.log(i);
        }
    });
*/

        var particleSystem = new BABYLON.ParticleSystem("particles", 200, scene);

        //Texture of each particle
        particleSystem.particleTexture = new BABYLON.Texture("./assets/Alpha Textures/LenseFlash_01.png", scene);

        var fountain = BABYLON.Mesh.CreateBox("fountain", 1.0, scene);
        fountain.scaling = new BABYLON.Vector3(800, 120, 1);

        var newPos = new BABYLON.Vector3(0,0,0);
        newPos.x = fountain.position.x + 0;
        newPos.y = fountain.position.y + 55;
        newPos.z = fountain.position.z + 170;

        fountain.position = newPos;
        fountain.rotation = new BABYLON.Vector3(45, 0, 0);
        //fountain.position
        // Where the particles come from
        particleSystem.emitter = fountain; // the starting object, the emitter
        particleSystem.minEmitBox = new BABYLON.Vector3(-1, -1, 0); // Starting all from
        particleSystem.maxEmitBox = new BABYLON.Vector3(1, 0, 0); // To...

        // Colors of all particles
        //particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
        //particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
        //particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

        // Size of each particle (random between...
        particleSystem.minSize = 2;
        particleSystem.maxSize = 4;

        // Life time of each particle (random between...
        particleSystem.minLifeTime = 0.1;
        particleSystem.maxLifeTime = 0.3;

        // Emission rate
        particleSystem.emitRate = 3000;

        // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

        // Set the gravity of all particles
        particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);

        // Direction of each particle after it has been emitted
        //particleSystem.direction1 = new BABYLON.Vector3(-7, 8, 3);
        //particleSystem.direction2 = new BABYLON.Vector3(7, 8, -3);

        // Angular speed, in radians
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;

        // Speed
        particleSystem.minEmitPower = 0;
        particleSystem.maxEmitPower = 0;
        particleSystem.updateSpeed = 0.005;

        scene.meshes.pop(fountain);
        // Start the particle system
        particleSystem.start();


    //CREATE CIRCLE OF SPHERE COLLIDERS
    var sphereAmount = 20;
    var radius = 3.5;
    var sphereDiameter = .8;
    var centerPos = torus.position;
    centerPos.y += 0.5;
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

    centerPos.y -= 0.5;

    //CREATE BACKBOARD COLLIDER
    var backboard = BABYLON.Mesh.CreateBox("backboard", 1 , scene);

    backboard.position = new BABYLON.Vector3(0, -2.6, 11.75);
    backboard.scaling = new BABYLON.Vector3(17.5, 14, 1);
    backboard.physicsImpostor = new BABYLON.PhysicsImpostor(backboard, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0,
    friction: 1,
    restitution: .8} )
    scene.meshes.pop(backboard);


    //CREATE COLLIDERS FOR NET
    var sphereAmount = 10;
    var radius = 3.4;
    var sphereDiameter = 0.25;
    var centerPos = torus.position;
    centerPos.y -= 4;
    var height = 4;
    for(var j = 0; j < height; j++)
    {
        for (var i = 0; i < sphereAmount; i++)
        {
            var sphere1 = BABYLON.Mesh.CreateSphere("sphere1", 10, sphereDiameter, scene);
            sphere1.position = new BABYLON.Vector3(
                centerPos.x + Math.sin(i * Math.PI * 2 / sphereAmount) * radius * (1- (j/2/height)),
                centerPos.y + height - j,
                centerPos.z + Math.cos(i * Math.PI * 2 / sphereAmount) * radius * (1- (j/2/height))
            );

            var currentMass = 100.01;
            if(j == 0)//top row
            {
                currentMass = 0;
            }
            //scene.meshes.pop(sphere);
            sphere1.physicsImpostor = new BABYLON.PhysicsImpostor(sphere1, BABYLON.PhysicsImpostor.SphereImpostor, {
                mass: currentMass

            })
            //scene.meshes.pop(sphere1);
            sphere1.physicsImpostor.sleep();
            netSpheres.push(sphere1);
        }
    }

    netSpheres.forEach(function(point, idx) {
        if (idx >= sphereAmount)
        {

            createJoint(point.physicsImpostor, netSpheres[idx - sphereAmount].physicsImpostor, 1.5);
            var horiDistance = .65*3 - .4* Math.floor(idx/sphereAmount);
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
    score = 0;
    var manager = new BABYLON.ActionManager(scene);
    scoreTrigger.actionManager = manager;

    for(var i = 0; i < basketballs.length; i++) {
        scoreTrigger.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                {
                    trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
                    parameter: basketballs[i]
                },
                function () {
                    addScore();
                }
            )
        );
    }

    var clothMat = new BABYLON.StandardMaterial("netMat", scene);
    //var testMat = new BABYLON.standr
    clothMat.diffuseTexture = new BABYLON.Texture("./assets/Layout/Net.png", scene);
    //clothMat.diffuseColor = new BABYLON.Color3(1,1,1);
    //clothMat.diffuseTexture.vOffset = 0.;
    clothMat.emissiveTexture = new BABYLON.Texture("./assets/Layout/Net.png", scene);
    clothMat.diffuseTexture.vScale = 4;
    clothMat.diffuseTexture.uScale = 2;
    clothMat.backFaceCulling = false;
    clothMat.diffuseTexture.hasAlpha = true;


    var net = BABYLON.Mesh.CreateGround("ground1", 1, 1, sphereAmount, scene, true);

    //net.needAlphaBlending = true;
    //net.needAlphaTesting = true;

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
                changeGameState(gameStates.ATTRACT);
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
        if(currentGameState == gameStates.ATTRACT) {
            basketballs[shotIndex].position = new BABYLON.Vector3(0, -9, -14);

            basketballs[shotIndex].physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
            basketballs[shotIndex].physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
            basketballs[shotIndex].physicsImpostor.applyImpulse(new BABYLON.Vector3(0, 18, 12), basketballs[shotIndex].getAbsolutePosition());
        }
        else if(currentGameState == gameStates.GAMEPLAY){
            basketballs[shotIndex].position = new BABYLON.Vector3(0, -9, -14);

            basketballs[shotIndex].physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
            basketballs[shotIndex].physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
            basketballs[shotIndex].physicsImpostor.applyImpulse(new BABYLON.Vector3(shotInfo.xSpeed, 18, 12), basketballs[shotIndex].getAbsolutePosition());
        }

        var convertedRot = new BABYLON.Vector3(0,0,0);
        var velocity = basketballs[shotIndex].physicsImpostor.getLinearVelocity();
        convertedRot.x = -velocity.z/5;
        convertedRot.z = -velocity.x;
        basketballs[shotIndex].physicsImpostor.setAngularVelocity(convertedRot);

        shotIndex++;
        if(shotIndex>=basketballs.length) shotIndex = 0;
    }

    function changeCamera()
    {
        currentCameraIndex++;
    }

    return scene;
}

var scene = createScene();

engine.runRenderLoop(function() {

    scene.render();
    var fpsLabel = document.getElementById("fpsLabel");
    fpsLabel.innerHTML = engine.getFps().toFixed()+ " fps";

    //scene.getPhysicsEngine().setTimeStep(1/(engine.getFps() * .75));
});

var $window = $(window);
var $pages = $('.pages'); // Input for roomname
var $passcodeInput = $('.passcodeInput'); // Input for roomname
var shotInfo;
var dragging = false;
var thrown = true;
var countdownStarted = true;

var thisRoom = '';
var courtName = '';
var hasplayer = false;

$passcodeInput.focus();

joinRoom();

function joinRoom()
{
  var roomtojoin = randomCode(7);

  var courtdata = {
    name: nameCourt(),
    room: roomtojoin
  };

  thisRoom = courtdata.room;
  courtName = courtdata.name;

  socket.emit('query request');
  socket.emit('join room', courtdata);
  socket.emit('add court', courtdata);
  console.log('COURT ' + courtdata.name + ' - joining room - ' + courtdata.room);

  updateUI();
  // $pages.fadeOut();
  // Tell the server your new room to connect to
  //socket.emit('room', roomname);
  //socket.emit('add user', jsonstring);
}

function joinQueryRoom(query) {
  roomcode = query;

  $('.insertRoomCode').text(roomcode);
  $(document).prop('title', roomcode);

  roomcode = roomcode.toUpperCase();

  courtData = {
    name: courtName,
    room: roomcode
  }

  console.log('joining room - ' + roomcode);
  socket.emit('room', roomcode);
  socket.emit('update court', courtData );
}

function nameCourt() {
  return randomCode(5);
}
function randomCode(howLong) {
  var randomname = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (var i = 0; i < howLong; i++)
    randomname += possible.charAt(Math.floor(Math.random() * possible.length));

  return randomname;
}

function randomRange (min, max)
{
    var number = (Math.random() * (min - max) + max);
    return number;
}

socket.on('query', function(query) {
  console.log('query received - ' + query);

  joinQueryRoom(query);
});

socket.on('take shot', function(info) {

    shotInfo = info;
    //var trigger = scene.actionManager.actions[0].trigger;
    console.log(shotInfo);
    var ae = BABYLON.ActionEvent.CreateNewFromScene(scene, {additionalData: "r"});
    //console.log(ae);
    scene.actionManager.processTrigger(scene.actionManager.actions[0].trigger,  ae);

    //console.log(scene.actionManager.actions.length);
});

socket.on('player joined court', function(userdata) {
    console.log('Player ' + userdata.username + ' - Joined Court - ' + userdata.court);
    playerData = userdata;
    if (userdata.court == courtName) {
      hasplayer = true;
    }
    scene.actionManager.processTrigger(scene.actionManager.actions[2].trigger, {additionalData: "y"});
});



socket.on('shot sent', function() {
  // console.log('We got a message back!');
})

socket.on('use random query', function() {
  console.log('no query received starting random');

  var query = randomCode(7);

  joinQueryRoom(query);
});


socket.on('reset game', function() {
  scene.actionManager.processTrigger(scene.actionManager.actions[1].trigger, {additionalData: "t"});
});



function addScore()
{
    if(currentGameState != gameStates.GAMEPLAY && currentGameState != gameStates.RESULTS) return;
    console.log("SCORE ADDED");
    score++;
    var scoreLabel = document.getElementById("scoreLabel");
    scoreLabel.innerHTML = "Score: " + score;
    playerData.score = score;
}

function updateUI()
{
    switch(currentGameState)
    {
        case gameStates.ATTRACT:
            score = 0;
            currentWaitTime = initWaitTime;
            hasplayer = false;
            scoreLabel.innerHTML = "";
            attractLabel.innerHTML = "COURT CODE: <br /> " + courtName;
            break;
        case gameStates.WAITING:
            scoreLabel.innerHTML = "COURT CODE: " + courtName;
            // attractLabel.innerHTML = "COURT CODE: " + courtName; + " <br/>" + initWaitTime.toString();
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
        case gameStates.INACTIVE:
            scoreLabel.innerHTML = "";
            attractLabel.innerHTML = "Please Wait, Game In Progress";
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
        initPos: new BABYLON.Vector3(20, 0, -15),
        //initPos: new BABYLON.Vector3(0, 5, -10),
        initFocus: new BABYLON.Vector3(0, -2.6, 11.75)
        //initFocus: new BABYLON.Vector3(0, -10, -30)
    }
    cameraSettings.push(cameraType);

    var cameraType = {
        cameraNames: cameraNames.freeThrow,
        //initPos: new BABYLON.Vector3(0, -25, -60),
        initPos: new BABYLON.Vector3(0, -7, -15),
        //initFocus: new BABYLON.Vector3(0, -12, 11.75),
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
