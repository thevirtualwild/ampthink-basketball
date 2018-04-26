// Main Controller Code
var socket = io();

var canvas = document.getElementById("canvas");
var attractLabel = document.getElementById("attractLabel");
var scoreLabel = document.getElementById("scoreLabel");

var engine = new BABYLON.Engine(canvas, true, null, false);
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
var shotIndex = 0;
createCameraTypes();

var currentCameraIndex = 0;
var currentTextureIndex = 0;

var prevAnimation;

var createScene = function(){
    var scene = new BABYLON.Scene(engine);

    engine.enableOfflineSupport = false;

    //engine.setHardwareScalingLevel(1.25);

    scene.clearColor = BABYLON.Color3.Black();
    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogStart = 80;
    scene.fogEnd = 130;
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
    scene.getPhysicsEngine().setTimeStep(1/(60 * .75));
    scene.getPhysicsEngine().getPhysicsPlugin().world.allowSleep = true;
    var camera = new BABYLON.FreeCamera("camera1", initCameraPos, scene);

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
                socket.emit("game over");
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
        newPos.y = torus.position.y + -10;
        newPos.z = torus.position.z - 0;
        camera.setTarget(newPos);
        camera.fov = 1;
        //camera.setTarget(cameraSettings[0].initFocus);

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

    //light.intensity = 0.7;

    var torus = BABYLON.Mesh.CreateTorus("torus", 4.3, 0.2, 50, scene);
    torus.position = new BABYLON.Vector3(0, -4.75, 8.9);
    scene.meshes.pop(torus);

    var basketballs = [];

    var basketball;
    // BABYLON.MeshBuilder.CreateSphere("basketball", { diameter: 2, segments: 16 }, scene);
    //var bigSphere = BABYLON.MeshBuilder.CreateSphere("bigSphere", { diameter: 2, segments: 16 }, scene);
    //bigSphere.position.y = -3;
    for(var i = 0; i < 10; i++)
    {
        basketball = BABYLON.Mesh.CreateSphere("basketball", 16, 1.88, scene);
        //basketball.position.y =+ i*2;
        //var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
        //basketball.material = myMaterial;
        basketball.position = torus.position;
        var newPos = new BABYLON.Vector3(0,0,0);
        newPos.x = basketball.position.x + i*3;
        newPos.y = basketball.position.y - 100;
        newPos.z = basketball.position.z + 5;
        basketball.position = newPos;

        basketball.scaling = new BABYLON.Vector3(1,1,1);
        basketballs.push(basketball);
    }

    BABYLON.SceneLoader.ImportMesh("", "./assets/BBall/", "BBall.obj", scene, function (mesh) {

        //var newBasketball;
        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
        myMaterial.diffuseTexture = new BABYLON.Texture("./assets/BBall/BBall_Albedo.png", scene);
        myMaterial.freeze();
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
            //newBasketball.scaling = new BABYLON.Vector3(0.05, 0.05, 0.05);
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

    BABYLON.SceneLoader.ImportMesh("", "./assets/Layout/", "Layout.babylon", scene, function (meshes) {

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        var mesh;

        for(var i = 0; i < meshes.length; i++)
        {

            if(meshes[i].name != "LightfBeam.004" &&
                meshes[i].name != "Floor" &&
                meshes[i].name != "Plane" &&
                meshes[i].name != "Glow_Floor" &&
                meshes[i].name != "Seatf_High" &&
                meshes[i].name != "Stairf_Base" &&
                meshes[i].name != "Stairf_Base_High" &&
                meshes[i].name != "Stairf_Base_Low" &&
                meshes[i].name != "Stairf_Base_Med" &&
                meshes[i].name != "Ref" &&
                meshes[i].name != "Blofcking" )
            {

                myMaterial.diffuseTexture = new BABYLON.Texture("./assets/Layout/Layout_Albedo.png", scene);
                myMaterial.diffuseTexture.hasAlpha = true;
                myMaterial.freeze();
                //myMaterial.bumpTexture = new BABYLON.Texture("./assets/Layout/Layout_Normal.png", scene);
                //myMaterial.specularTexture = new BABYLON.Texture("./assets/Layout/Layout_Smoothness.png", scene);

                var newPos = new BABYLON.Vector3(0,0,0);
                newPos.x = meshes[i].position.x + 0;
                newPos.y = meshes[i].position.y + -36;
                newPos.z = meshes[i].position.z - 60;
                meshes[i].position = newPos
                console.log(meshes[i].name);
                meshes[i].material = myMaterial;
                meshes[i].freezeWorldMatrix();


            }
            else if(meshes[i].name == "Ref" || meshes[i].name == "Plane" || meshes[i].name == "Glow_Floor")
            {
               var myMaterial1 = new BABYLON.StandardMaterial("myMaterial1", scene);

                var newPos = new BABYLON.Vector3(0,0,0);
                newPos.x = meshes[i].position.x + 0;
                newPos.y = meshes[i].position.y + -36;
                newPos.z = meshes[i].position.z - 60;
                meshes[i].position = newPos;
                meshes[i].material = myMaterial1;
                myMaterial1.freeze();
                meshes[i].freezeWorldMatrix();
                //scene.meshes.pop(meshes[i]);
            }
            else if(meshes[i].name == "Blofcking")
            {
                var myMaterial1 = new BABYLON.StandardMaterial("myMaterial1", scene);
                var diffuseTexture = new BABYLON.Texture("./assets/Layout/Layout_Albedo.png", scene);
                var offset = new BABYLON.Vector2(1, 1);
                var scale = new BABYLON.Vector2(.5, .5);
                diffuseTexture.uScale =  scale.x;
                diffuseTexture.vScale = scale.y;
                diffuseTexture.uOffset = offset.x;
                diffuseTexture.vOffset = offset.y;
                //myMaterial1.diffuseTexture = new BABYLON.Texture("./assets/Layout/Layout_Albedo.png", scene);
                myMaterial1.diffuseTexture = diffuseTexture;
                myMaterial1.diffuseTexture.hasAlpha = true;
                var normalTexture = new BABYLON.Texture("./assets/Layout/Layout_Normal.png", scene);
                normalTexture.uScale =  scale.x;
                normalTexture.vScale = scale.y;
                normalTexture.uOffset = offset.x;
                normalTexture.vOffset = offset.y;
                //myMaterial1.diffuseTexture = new BABYLON.Texture("./assets/Layout/Layout_Albedo.png", scene);
                //myMaterial1.bumpTexture = normalTexture;
                var specularTexture = new BABYLON.Texture("./assets/Layout/Layout_Smoothness.png", scene);
                specularTexture.uScale =  scale.x;
                specularTexture.vScale = scale.y;
                specularTexture.uOffset = offset.x;
                specularTexture.vOffset = offset.y;
                //myMaterial1.diffuseTexture = new BABYLON.Texture("./assets/Layout/Layout_Albedo.png", scene);
                //myMaterial1.specularTexture = specularTexture;
                //myMaterial1.
                //meshes[i].material.zOffset = 0.5;
                //myMaterial1.alpha = 0;
                var newPos = new BABYLON.Vector3(0,0,0);
                newPos.x = meshes[i].position.x + 0;
                newPos.y = meshes[i].position.y + -36;
                newPos.z = meshes[i].position.z - 60;
                meshes[i].position = newPos;
                meshes[i].material = myMaterial1;
                myMaterial1.freeze();
                meshes[i].freezeWorldMatrix();
                //scene.meshes.pop(meshes[i]);
            }
            else if(meshes[i].name == "Floor")
            {
                //var myMaterial2 = new BABYLON.StandardMaterial("myMaterial2", scene);
                //meshes[i].material = myMaterial2;
                //scene.meshes.pop(meshes[i]);
            }
            else
            {
                scene.meshes.pop(meshes[i]);
            }
        }
/*
        var particleSystem = new BABYLON.ParticleSystem("particles", 200, scene);

        //Texture of each particle
        particleSystem.particleTexture = new BABYLON.Texture("./assets/Alpha Textures/LenseFlash_01.png", scene);

        var fountain = BABYLON.Mesh.CreateBox("fountain", 1.0, scene);
        fountain.scaling = new BABYLON.Vector3(120, 120, 1);

        var newPos = new BABYLON.Vector3(0,0,0);
        newPos.x = fountain.position.x + 0;
        newPos.y = fountain.position.y + 0;
        newPos.z = fountain.position.z + 100;

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
        particleSystem.emitRate = 30;

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
        */
    });


    //CREATE CIRCLE OF SPHERE COLLIDERS
    var sphereAmount = 30;
    var radius = 2.55;
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
    backboard.scaling = new BABYLON.Vector3(17.5, 14, 1);
    backboard.physicsImpostor = new BABYLON.PhysicsImpostor(backboard, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0,
    friction: 1,
    restitution: .8} )
    scene.meshes.pop(backboard);


    //CREATE COLLIDERS FOR NET
    var sphereAmount = 10;
    var radius = 2.55;
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

            var currentMass = 50.01;
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

            createJoint(point.physicsImpostor, netSpheres[idx - sphereAmount].physicsImpostor, 1);
            var horiDistance = .45*3 - .165* Math.floor(idx/sphereAmount);
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
        if(currentGameState == gameStates.ATTRACT) {
            basketballs[shotIndex].position = new BABYLON.Vector3(0, -20, -40);

            basketballs[shotIndex].physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
            basketballs[shotIndex].physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
            basketballs[shotIndex].physicsImpostor.applyImpulse(new BABYLON.Vector3(randomRange(-.3, .3), randomRange(26, 28), randomRange(17, 20)), basketballs[shotIndex].getAbsolutePosition());
        }
        else if(currentGameState == gameStates.GAMEPLAY){
            basketballs[shotIndex].position = new BABYLON.Vector3(0, -20, -40);

            basketballs[shotIndex].physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
            basketballs[shotIndex].physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
            basketballs[shotIndex].physicsImpostor.applyImpulse(new BABYLON.Vector3(shotInfo.xSpeed, randomRange(26, 28), randomRange(17, 20)), basketballs[shotIndex].getAbsolutePosition());
        }

        var convertedRot = new BABYLON.Vector3(0,0,0);
        var velocity = basketballs[shotIndex].physicsImpostor.getLinearVelocity();
        convertedRot.x = velocity.z;
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
    return number;
}

socket.on('take shot', function(info) {

    shotInfo = info;
    //var trigger = scene.actionManager.actions[0].trigger;
    console.log(shotInfo);
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
    if(currentGameState != gameStates.GAMEPLAY && currentGameState != gameStates.RESULTS) return;
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
            score = 0;
            currentWaitTime = initWaitTime;
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
        initPos: new BABYLON.Vector3(20, 0, -15),
        //initPos: new BABYLON.Vector3(0, 5, -10),
        initFocus: new BABYLON.Vector3(0, -2.6, 11.75)
        //initFocus: new BABYLON.Vector3(0, -10, -30)
    }
    cameraSettings.push(cameraType);

    var cameraType = {
        cameraNames: cameraNames.freeThrow,
        initPos: new BABYLON.Vector3(0, -25, -60),
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
