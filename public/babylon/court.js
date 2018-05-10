// Main Controller Code

//Variables (Folded below)
var socket = io();

var canvas = document.getElementById("canvas");
var attractLabel = document.getElementById("attractLabel");
var scoreLabel = document.getElementById("scoreLabel");

var engine = new BABYLON.Engine(canvas, true, null, false);
var useCannon = true;

var gameStates = Object.freeze({"ATTRACT": 0, "WAITING": 1, "GAMEPLAY": 2, "RESULTS": 3, "INACTIVE": 4});
var currentGameState = gameStates.ATTRACT;

var netStates = Object.freeze({"FREE": 0, "WAITING": 1, "LERPING": 2});
var currentNetState = netStates.FREE;

var cameraNames = Object.freeze({"freeThrow": 0, "quarterFar": 1, "close": 2});
var selectedCameraType = cameraNames.freeThrow;

var basketballStates = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var pulseAmbientColor = false;

var ISMASTER = false;
var readyToSync = false;
var masterData;
//Game Variables?
var totalTime = 0;
var netSpheres = [];
var attractShots = [-.12, 1.2, 1.1, .3, 1, -.2, -2.5, 1.8, 0, 3.2]
var cameraSettings = [];

var initWaitTime = 7;
var currentWaitTime = 7;
var initGameTime = 30;
var currentGameTime = 30;
var initResultsTime = 10;
var currentResultsTime = 10;
var shotIndex = 0;
var attractIndex = 0;
var currentNetLerpDelayTime = 2;
var initNetLerpDelayTime = 2;
var currentNetLerpTime = 0.25;
var initNetLerpTime = 0.25;

var initEmitTime = 0.5;
var currentEmitTime = 0.5;

var gameReady = false;

var currentCameraIndex = 0;
var currentTextureIndex = 0;

var prevAnimation;

var playerData;

var score = 0;
var combo = 0;
var newBasketballs = [];
var newBasketballOutlines = [];

var emitInitTime = .5;
var emitCurrentTime = .5;

createCameraTypes();



var createScene = function(){
    var scene = new BABYLON.Scene(engine);

    var shotClockTextures = [10];

    engine.enableOfflineSupport = false;

    //engine.setHardwareScalingLevel(1.25);

    scene.clearColor = BABYLON.Color3.Black();

    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogStart = 30;
    scene.fogEnd = 100;
    scene.fogColor =  BABYLON.Color3.Black();

    //scene.autoClear = false; // Color buffer
    //scene.autoClearDepthAndStencil = false; // Depth and stencil, obviously

    var initCameraPos;
    var initCameraFocus;

    if(useCannon) {
        var physicsPlugin = new BABYLON.CannonJSPlugin(true, 1);
        //physicsPlugin.setTimeStep(1/100);
    }
    else
    {
        var physicsPlugin = new BABYLON.OimoJSPlugin(5);
        //physicsPlugin.setTimeStep(1/100);
        physicsPlugin.allowSleep = true;

    }

    var gravityVector = new BABYLON.Vector3(0,-15.81, 0);
    scene.enablePhysics(gravityVector, physicsPlugin);
    scene.getPhysicsEngine().setTimeStep(1/(20 * .6));
    //scene.getPhysicsEngine().getPhysicsPlugin().world.allowSleep = true;
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
    //camera.maxZ = 130;
    //camera.minZ = 1;

    var shotClockTens =  BABYLON.Mesh.CreatePlane("shotClock", 1.0, scene);
    var shotClockOnes =  BABYLON.Mesh.CreatePlane("shotClock", 1.0, scene);

    var firstDigit;
    var secondDigit;

    shotClockTens.position = new BABYLON.Vector3(-1.3, +3.5, 12);
    shotClockTens.scaling = new BABYLON.Vector3(2.5, 5, .1);

    shotClockOnes.position = new BABYLON.Vector3(1.3, +3.5, 12);
    shotClockOnes.scaling = new BABYLON.Vector3(2.5, 5, .1);

    var myMaterialTens = new BABYLON.StandardMaterial("myMaterial", scene);
    var myMaterialOnes = new BABYLON.StandardMaterial("myMaterial", scene);

    shotClockTens.material = myMaterialTens;
    shotClockOnes.material = myMaterialOnes;

    currentGameTime = initGameTime;

    for(var i = 0; i < 10; i++)
    {
        shotClockTextures[i] = new BABYLON.Texture("./assets/ShotClock/Alphas/Texture" + i + ".png", scene, false, false, 1, function()
        {
            if(shotClockTextures[0].hasAlpha == false)
            {
                updateClock();
            }
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
                console.log("Aspect Ratio: " + canvas.width/canvas.height);
                animateCamera();
                updateUI();
                combo = 0;
                changeBallFX(false);
                break;
            case gameStates.WAITING:
                currentGameState = gameState;
                currentCameraIndex = 1;
                shotIndex = 0;
                animateCamera();
                updateUI();
                break;
            case gameStates.GAMEPLAY:
                currentGameState = gameState;
                currentCameraIndex = 1;
                updateUI();
                updateBallColor();
                break;
            case gameStates.RESULTS:
                currentGameState = gameState;
                currentCameraIndex = 1;
                gameOver();

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

    function animateCamera() {
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

    scene.registerBeforeRender(function() {
      var i = 0;

      var newPos = new BABYLON.Vector3(0,0,0);
      newPos.x = torus.position.x + 0;
      newPos.y = torus.position.y + 4;
      newPos.z = torus.position.z - 0;
      camera.setTarget(newPos);

      //dynamically set fov based on screen resolution
      camera.fov = 1.9 + (-.676 * canvas.width/canvas.height);
      //console.log(camera.fov);






      if(currentGameState == gameStates.WAITING)
      {
          currentWaitTime -= (engine.getDeltaTime() / 1000);

          UIWaitingUpdateClock(currentWaitTime);


          if(currentWaitTime <= -5)
          {
            if (hasplayer) {
              changeGameState(gameStates.GAMEPLAY);
            } else {
              changeGameState(gameStates.INACTIVE);
            }
          }
          else if(currentWaitTime <= -4 && !gameReady)
          {
              gameReady = true;
              if (hasplayer) {
                  socket.emit("game almost ready", courtName);
              }
          }
          else if(currentWaitTime <= -2)
          {
              //attractLabel.innerHTML = "GAME STARTS IN <br />" +  (5.5 + currentWaitTime).toFixed(0);
              //attractLabel.innerHTML = "";
          }
          else if(currentWaitTime < 0)
          {
              //attractLabel.innerHTML = "PLAYERS LOCKED IN";
              //attractLabel.innerHTML = "";
          }
          else
          {
              if (hasplayer) {
                  //attractLabel.innerHTML =  currentWaitTime.toFixed(0) + "<br /> WAITING FOR PLAYERS";
                  //attractLabel.innerHTML =  "";
              }
          }
      }
      else if(currentGameState == gameStates.GAMEPLAY)
      {
          currentGameTime -= (engine.getDeltaTime() / 1000);
          var time = currentGameTime.toFixed(2);
          attractLabel.innerHTML =  "";

          if(currentGameTime <= 0)
          {
              changeGameState(gameStates.RESULTS);
              currentGameTime = 0;
          }

          updateClock();
      }
      else if(currentGameState == gameStates.RESULTS)
      {
          currentResultsTime -= (engine.getDeltaTime() / 1000);
          //attractLabel.innerHTML = "Score: " + score;

          if(currentResultsTime <= -2)
          {
              changeGameState(gameStates.ATTRACT);
              currentGameTime = initGameTime;
              updateClock();
              socket.emit('room reset');
          }
          else if(currentResultsTime <= 0)
          {
              UIResultsAnimateOut();
              currentGameTime = initGameTime;
              updateClock();
          }

      }

      if(currentNetState ==  netStates.FREE)
      {
          currentNetLerpDelayTime = initNetLerpDelayTime;
          currentNetLerpTime = initNetLerpTime;
      }
      else if(currentNetState == netStates.WAITING)
      {
          currentNetLerpTime = initNetLerpTime;
          //console.log(currentNetLerpDelayTime);
          currentNetLerpDelayTime -= (engine.getDeltaTime() / 1000);
          if(currentNetLerpDelayTime <= 0)
          {
              currentNetState = netStates.FREE;
          }
      }
      else if(currentNetState == netStates.LERPING)
      {
          currentNetLerpTime -= (engine.getDeltaTime() / 1000);
          if(currentNetLerpTime <= 0)
          {
              currentNetState = netStates.FREE;
          }
      }

      totalTime += engine.getDeltaTime()/50;

      if(pulseAmbientColor)
      {
          scene.ambientColor = new BABYLON.Color3(
              Math.abs(Math.sin(totalTime)),
              Math.abs(Math.sin(totalTime)),
              Math.abs(Math.sin(totalTime)));
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
        basketball = BABYLON.Mesh.CreateSphere("basketball", 16, 3.1, scene);
        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
        basketball.material = myMaterial;
        basketball.position = torus.position;
        var newPos = new BABYLON.Vector3(0,0,0);
        newPos.x = basketball.position.x + i*3;
        newPos.y = basketball.position.y - 100;
        newPos.z = basketball.position.z + 5;
        basketball.position = newPos;
        basketball.name = i;
        basketball.scaling = new BABYLON.Vector3(1,1,1);
        basketballs.push(basketball);
    }

    scene.ambientColor = new BABYLON.Color3(1,1,1);

    BABYLON.SceneLoader.ImportMesh("", "./assets/BBall_V2/", "BBall_V2.babylon", scene, function (mesh) {

        var baseMaterial = new BABYLON.StandardMaterial("baseMaterial", scene);
        var overlayMaterial = new BABYLON.StandardMaterial("overlayMaterial", scene);
        var multimat = new BABYLON.MultiMaterial("multi", scene);

        baseMaterial.emissiveTexture = new BABYLON.Texture("./assets/BBall_V2/BBall_V2_Albedo.png", scene);
        baseMaterial.diffuseTexture = new BABYLON.Texture("./assets/BBall_V2/BBall_V2_Albedo.png", scene);
        baseMaterial.diffuseTexture.hasAlpha = true;

        overlayMaterial.ambientColor = new BABYLON.Color3(1,.4,.2);

        multimat.subMaterials.push(baseMaterial);
        multimat.subMaterials.push(overlayMaterial);

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
            newBasketball.scaling = new BABYLON.Vector3(1.6, 1.6, 1.6);
            newBasketball.material = multimat;

            newBasketballs.push(newBasketball);
        }
        scene.registerBeforeRender(function()
        {
            for(var i = 0 ; i < basketballs.length; i++)
            {
                newBasketballs[i].parent = basketballs[i];

                if (basketballs[0].position.y < -45)
                {
                    if (currentGameState == gameStates.ATTRACT)
                    {
                        shotIndex = 0;
                        takeShot();
                    }
                }

                if(currentGameState == gameStates.GAMEPLAY || currentGameState == gameStates.RESULTS)
                {
                    if(basketballs[i].position.y < -30 &&
                        basketballs[i].physicsImpostor.getLinearVelocity().y < 0 &&
                        basketballStates[i] == 1)
                    {
                        combo = 0;
                        //console.log("COMBO BREAKER " + i);
                        UIGameplayAnimateBadgeOff();

                        changeBallFX(false);
                        basketballStates[i] = 0;
                    }
                }
            }
            currentEmitTime -= (engine.getDeltaTime() / 1000);
            if(currentEmitTime <= 0)
            {
                currentEmitTime = initEmitTime;

                if(ISMASTER)
                {
                    var syncData = {
                        cameraPosition: camera.position,
                        gameTime: currentGameTime,
                        waitTime: currentWaitTime,
                        resultsTime: currentResultsTime,
                        basketballs: []
                    }

                    for(var i = 0; i < basketballs.length; i++) {
                        var newbasketballvar = {
                            posx: basketballs[i].position.x,
                            posy: basketballs[i].position.y,
                            posz: basketballs[i].position.z,
                            rotx: basketballs[i].rotation.x,
                            roty: basketballs[i].rotation.y,
                            rotz: basketballs[i].rotation.z,
                            velx: basketballs[i].physicsImpostor.getLinearVelocity().x,
                            vely: basketballs[i].physicsImpostor.getLinearVelocity().y,
                            velz: basketballs[i].physicsImpostor.getLinearVelocity().z,
                            angx: basketballs[i].physicsImpostor.getAngularVelocity().x,
                            angy: basketballs[i].physicsImpostor.getAngularVelocity().y,
                            angz: basketballs[i].physicsImpostor.getAngularVelocity().z
                        }

                        syncData['basketballs'].push(newbasketballvar);
                    }

                    socket.emit("sync screens ", syncData);
                    console.log(syncData);
                }
            }

            if(readyToSync && !ISMASTER)
            {
                if(masterData === undefined) return;

                camera.position = masterData.cameraPosition;
                currentWaitTime = masterData.waitTime;
                currentGameTime = masterData.gameTime;
                currentResultsTime = masterData.resultsTime;

                for(var i = 0; i < basketballs.length; i++)
                {

                    var newPos = BABYLON.Vector3(masterData.basketballs[i].posx,masterData.basketballs[i].posy, masterData.basketballs[i].posz);
                    var newRot = BABYLON.Vector3(masterData.basketballs[i].rotx,masterData.basketballs[i].roty, masterData.basketballs[i].rotz);
                    var newVel = BABYLON.Vector3(masterData.basketballs[i].velx,masterData.basketballs[i].vely, masterData.basketballs[i].velz);
                    var newAng = BABYLON.Vector3(masterData.basketballs[i].angx,masterData.basketballs[i].angy, masterData.basketballs[i].angz);

                    basketballs[i].position = newPos;
                    basketballs[i].rotation = newRot;
                    basketballs[i].physicsImpostor.setLinearVelocity(newVel);
                    basketballs[i].physicsImpostor.setAngularVelocity(newAng);

                }
                readyToSync =false;
            }
        });
    });

    BABYLON.SceneLoader.ImportMesh("", "./assets/BBall/", "Bball_Outline.babylon", scene, function (mesh) {

        var baseMaterial = new BABYLON.StandardMaterial("baseMaterial", scene);

        baseMaterial.ambientColor = new BABYLON.Color3(1, 0, 0);
        baseMaterial.alpha = 0;
        scene.meshes.pop(mesh[0]);

        for (var i= 0; i< basketballs.length; i++)
        {
            var newBasketballOutline = mesh[0].clone("index: " + i);

            //newBasketball.position.x =+ i*2;
            newBasketballOutline.scaling = new BABYLON.Vector3(1.6, 1.6, 1.6);
            newBasketballOutline.material = baseMaterial;

            newBasketballOutlines.push(newBasketballOutline);
        }
        scene.registerBeforeRender(function()
        {
            for(var i = 0 ; i < basketballs.length; i++)
            {
                newBasketballOutlines[i].parent = basketballs[i];
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
        mesh.material = myMaterial;
        mesh.freezeWorldMatrix();

        var h1 = new BABYLON.HighlightLayer("hl1", scene);
    });

    BABYLON.SceneLoader.ImportMesh("Goal_Lights_Backboard", "./assets/Layout/", "Goal.babylon", scene, function (mesh) {

            var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

            var mesh = mesh[0];

            myMaterial.emissiveTexture = new BABYLON.Texture("./assets/Alpha Textures/LightGradient_Red.png", scene);
            myMaterial.diffuseTexture = new BABYLON.Texture("./assets/Alpha Textures/LightGradient_Red.png", scene);
            myMaterial.opacityTexture = new BABYLON.Texture("./assets/Alpha Textures/LightGradient_Red.png", scene);

            myMaterial.diffuseTexture.hasAlpha = true;

            myMaterial.alpha = 0;
            var newPos = new BABYLON.Vector3(0, 0, 0);
            newPos.x = mesh.position.x + 0;
            newPos.y = mesh.position.y + -35.75;
            newPos.z = mesh.position.z - 60;
            mesh.position = newPos;
            mesh.material = myMaterial;
            //scene.meshes.pop(mesh);
        scene.registerBeforeRender(function()
        {
            if(currentGameState == gameStates.RESULTS)
            {
                myMaterial.alpha = 1;
            }
            else
            {
                myMaterial.alpha = 0;
            }
        })
    });

    BABYLON.SceneLoader.ImportMesh("Goal_Rim", "./assets/Layout/", "Goal.babylon", scene, function (mesh) {

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
        var mesh = mesh[0];
        myMaterial.emissiveTexture = new BABYLON.Texture("./assets/Colors.png", scene);
        var newPos = new BABYLON.Vector3(0, 0, 0);
        newPos.x = mesh.position.x + 0;
        newPos.y = mesh.position.y + -35.75;
        newPos.z = mesh.position.z - 70;
        mesh.position = newPos;
        mesh.scaling = new BABYLON.Vector3(1.1, 1, 1.1);
        mesh.material = myMaterial;
        mesh.freezeWorldMatrix();

    });

    BABYLON.SceneLoader.ImportMesh("Goal_Base", "./assets/Layout/", "Goal.babylon", scene, function (mesh) {

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        var mesh = mesh[0];

        myMaterial.emissiveTexture = new BABYLON.Texture("./assets/Colors.png", scene);

        var newPos = new BABYLON.Vector3(0, 0, 0);
        newPos.x = mesh.position.x + 0;
        newPos.y = mesh.position.y + -35.75;
        newPos.z = mesh.position.z - 60;
        mesh.position = newPos;
        mesh.material = myMaterial;
        mesh.freezeWorldMatrix();

    });

    BABYLON.SceneLoader.ImportMesh("", "./assets/Layout/", "Seating_Close.babylon", scene, function (meshes) {

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        for (var i = 0; i < meshes.length; i++) {

            if (meshes[i].name != "ArenaLights_Large" &&
                meshes[i].name != "ArenaLights_Small" &&
                meshes[i].name != "Floor") {

                myMaterial.emissiveTexture = new BABYLON.Texture("./assets/Colors.png", scene);
                //myMaterial.diffuseTexture.hasAlpha = true;
                //myMaterial.freeze();
                //myMaterial.bumpTexture = new BABYLON.Texture("./assets/Layout/Layout_Normal.png", scene);
                //myMaterial.specularTexture = new BABYLON.Texture("./assets/Layout/Layout_Smoothness.png", scene);

                var newPos = new BABYLON.Vector3(0, 0, 0);
                newPos.x = meshes[i].position.x + 0;
                newPos.y = meshes[i].position.y + -36;
                newPos.z = meshes[i].position.z - 60;
                meshes[i].position = newPos
                meshes[i].material = myMaterial;
                meshes[i].freezeWorldMatrix();
            }
            else {
                scene.meshes.pop(meshes[i]);
            }
        }
    });

    BABYLON.SceneLoader.ImportMesh("ArenaLights_Small", "./assets/Layout/", "ArenaLights.babylon", scene, function (mesh) {

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        var mesh = mesh[0];

        myMaterial.emissiveTexture = new BABYLON.Texture("./assets/Alpha Textures/ArenaLights_Small.png", scene);
        myMaterial.diffuseTexture = new BABYLON.Texture("./assets/Alpha Textures/ArenaLights_Small.png", scene);
        myMaterial.opacityTexture = new BABYLON.Texture("./assets/Alpha Textures/ArenaLights_Small.png", scene);
        myMaterial.diffuseTexture.hasAlpha = true;

        var newPos = new BABYLON.Vector3(0, 0, 0);
        newPos.x = mesh.position.x + 0;
        newPos.y = mesh.position.y + -35.75;
        newPos.z = mesh.position.z - 60;
        mesh.position = newPos;
        //mesh.scaling = new BABYLON.Vector3(.8, 1, 1.1);
        //console.log(meshes[i].name);
        mesh.material = myMaterial;
        //console.log(mesh[0].name);

    });

    BABYLON.SceneLoader.ImportMesh("ArenaLights_Large", "./assets/Layout/", "ArenaLights.babylon", scene, function (mesh) {

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        var mesh = mesh[0];

        myMaterial.emissiveTexture = new BABYLON.Texture("./assets/Alpha Textures/ArenaLights_Large.png", scene);
        myMaterial.diffuseTexture = new BABYLON.Texture("./assets/Alpha Textures/ArenaLights_Large.png", scene);
        myMaterial.opacityTexture = new BABYLON.Texture("./assets/Alpha Textures/ArenaLights_Large.png", scene);
        myMaterial.diffuseTexture.hasAlpha = true;

        var newPos = new BABYLON.Vector3(0, 0, 0);
        newPos.x = mesh.position.x + 0;
        newPos.y = mesh.position.y + -35.75;
        newPos.z = mesh.position.z - 60;
        mesh.position = newPos;
        //mesh.scaling = new BABYLON.Vector3(.8, 1, 1.1);
        //console.log(meshes[i].name);
        mesh.material = myMaterial;
        //console.log(mesh[0].name);

    });

    var particleSystem = new BABYLON.ParticleSystem("particles", 200, scene);

    //Texture of each particle
    particleSystem.particleTexture = new BABYLON.Texture("./assets/Alpha Textures/LenseFlash_01.png", scene);

    var fountain = BABYLON.Mesh.CreateBox("fountain", 1.0, scene);
    fountain.scaling = new BABYLON.Vector3(800, 120, 1);

    var newPos = new BABYLON.Vector3(0,0,0);
    newPos.x = fountain.position.x + 0;
    newPos.y = fountain.position.y + 25;
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
    var sphereAmount = 10;
    var radius = 3.5;
    var sphereDiameter = 1;
    var centerPos = torus.position;
    centerPos.y += 0.4;
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
            restitution:4} )
        scene.meshes.pop(sphere);
    }

    centerPos.y -= 0.5;

    //CREATE BACKBOARD COLLIDER
    var backboard = BABYLON.Mesh.CreateBox("backboard", 1 , scene);

    backboard.position = new BABYLON.Vector3(0, 2.5, 12.75);
    backboard.scaling = new BABYLON.Vector3(17.5, 14, 1);
    backboard.physicsImpostor = new BABYLON.PhysicsImpostor(backboard, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0,
    friction: 1,
    restitution: .8} );
    scene.meshes.pop(backboard);


    //CREATE COLLIDERS FOR NET
    var sphereAmount = 10;
    var radius = 3.4;
    var sphereDiameter = .1;
    var centerPos = torus.position;
    var registered = false;
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

            var currentMass;
            var currentRestitution;
            if(useCannon)
            {
                currentMass = .1;
                currentRestitution = 20 - j*6;
            }
            else
            {
                currentMass = 15000 - j*4000;
                //currentMass = 55000 - j*4000;
            }

            if(j == 0)//top row
            {
                currentMass = 0;
            }

            //scene.meshes.pop(sphere);
            sphere1.physicsImpostor = new BABYLON.PhysicsImpostor(sphere1, BABYLON.PhysicsImpostor.SphereImpostor, {
                mass: currentMass,
                restitution: currentRestitution

            })

            netSpheres.push(sphere1);

            if(!registered)
            {
                netSpheres[0].physicsImpostor.registerAfterPhysicsStep(function ()
                {
                    if(currentNetState == netStates.FREE)
                    {
                        for(var k = 0; k < netSpheres.length; k++)
                        {
                            if(netSpheres[k].physicsImpostor) {
                                currentSphereVel = netSpheres[k].physicsImpostor.getLinearVelocity();
                                currentSphereVel.x *= .997;
                                currentSphereVel.y *= .997;
                                currentSphereVel.z *= .997;
                                netSpheres[k].physicsImpostor.setLinearVelocity(currentSphereVel);
                            }
                        }
                        registered = true;
                    }
                });
            }
        }
    }

    netSpheres.forEach(function(point, idx) {
        if (idx >= sphereAmount)
        {
            var vertDistance = 1.75 - .1* Math.floor(idx/sphereAmount);

            var row = Math.floor(idx/sphereAmount);
            var horiDistance = .65*3 - .4* row;

            if(row == 0)
            {
                horiDistance = 1.85
                //vertDistance = 3 - .1* Math.floor(idx/sphereAmount);
            }
            else if(row == 1)
            {
                horiDistance = 1.2;
                vertDistance = 2.25;
            }
            else if(row == 2)
            {
                horiDistance = 1;
                vertDistance = 1.5
            }
            else if(row == 3)
            {
                horiDistance = 1;
                vertDistance = 1.5
            }

            if (idx >= sphereAmount)
            {
                createJoint(point.physicsImpostor, netSpheres[idx - sphereAmount].physicsImpostor, vertDistance);
            }

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

    var scoreTrigger = new BABYLON.Mesh.CreateBox("scoreTrigger", 2, scene);
    scoreTrigger.position = torus.position;
    scoreTrigger.position.y += 2;
    var clearMat = new BABYLON.StandardMaterial("myMaterial", scene);
    clearMat.alpha = 0;
    scoreTrigger.material = clearMat;
    //scene.meshes.pop(scoreTrigger);
    score = 0;
    var manager = new BABYLON.ActionManager(scene);
    scoreTrigger.actionManager = manager;
var test;

for(var i = 0; i < basketballs.length; i++) {
    scoreTrigger.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            {
                trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
                parameter: basketballs[i]
            },
            function () {

                //console.log("HIT TRIGGER");
                if(currentGameState == gameStates.GAMEPLAY || currentGameState == gameStates.RESULTS)
                {
                    var idx = shotIndex-1;
                    if(idx < 0) idx = 9;

                    if(basketballStates[idx] != 0) {
                        basketballStates[idx] = 0;
                        console.log("disabled " + idx);
                        addScore();

                        if(combo >= 2)
                        {
                            UIGameplayAnimateBadgeOn(combo);
                        }

                        if(combo >= 3)
                        {
                            changeBallFX(true);
                        }
                    }
                }
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
clothMat.diffuseTexture.uScale = 4;
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
    var currentSphereVel;
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

    function updateClock() {
        if (currentGameTime + 1 > 10) {
            var firstDigit = Math.ceil(parseInt((currentGameTime+1).toFixed(2).substr(0, 1)));
            var secondDigit = Math.ceil(parseInt((currentGameTime+1).toFixed(2).substr(1, 1)));
        }
        else {
            firstDigit = 0;
            secondDigit = parseInt((currentGameTime+ 1).toFixed(2).substr(0, 1));
        }

        if(currentGameTime == 30)
        {
            secondDigit = 0;
        }
        else if(currentGameTime == 0)
        {
            secondDigit = 0;
        }

        myMaterialTens.emissiveTexture = shotClockTextures[firstDigit];
        myMaterialTens.diffuseTexture = shotClockTextures[firstDigit];
        myMaterialTens.opacityTexture = shotClockTextures[firstDigit];
        myMaterialTens.emissiveTexture.vScale = -1;

        myMaterialOnes.emissiveTexture = shotClockTextures[secondDigit];
        myMaterialOnes.diffuseTexture = shotClockTextures[secondDigit];
        myMaterialOnes.opacityTexture = shotClockTextures[secondDigit];
        myMaterialOnes.emissiveTexture.vScale = -1;
    }

    function createJoint(imp1, imp2, distance) {
        var joint = new BABYLON.DistanceJoint({
            maxDistance: distance,
            nativeParams:{
                collision:false
            }
        })
        imp1.addJoint(imp2, joint);
    }

    function changeBallFX(toggle)
    {
        if(toggle == true) {
            pulseAmbientColor = true;
            for(var i = 0; i < newBasketballOutlines.length; i++)
            {
                newBasketballOutlines[i].material.alpha = 1;
            }
        }
        else {
            pulseAmbientColor = false;
            scene.ambientColor = new BABYLON.Color3(1,1,1);
            for(var i = 0; i < newBasketballOutlines.length; i++)
            {
                newBasketballOutlines[i].material.alpha = 0;
            }
        }
    }

    function takeShot()
    {
        if(currentGameState == gameStates.ATTRACT) {
            basketballs[shotIndex].position = new BABYLON.Vector3(0, -9, -14);

            basketballs[shotIndex].physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
            basketballs[shotIndex].physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
            basketballs[shotIndex].physicsImpostor.applyImpulse(new BABYLON.Vector3(attractShots[attractIndex], 19, 10.5), basketballs[shotIndex].getAbsolutePosition());

        }
        else if(currentGameState == gameStates.GAMEPLAY){
            basketballs[shotIndex].position = new BABYLON.Vector3(0, -9, -14);

            basketballs[shotIndex].physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
            basketballs[shotIndex].physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
            basketballs[shotIndex].physicsImpostor.applyImpulse(new BABYLON.Vector3(shotInfo.xSpeed, 18, 12), basketballs[shotIndex].getAbsolutePosition());
            basketballs[shotIndex].material.alpha = 1;
            basketballStates[shotIndex] = 1;
        }


        var convertedRot = new BABYLON.Vector3(0,0,0);
        var velocity = basketballs[shotIndex].physicsImpostor.getLinearVelocity();
        convertedRot.x = -velocity.z/5;
        convertedRot.z = -velocity.x;
        basketballs[shotIndex].physicsImpostor.setAngularVelocity(convertedRot);

        shotIndex++;
        if(shotIndex>=basketballs.length) shotIndex = 0;

        attractIndex++;
        if(attractIndex >= attractShots.length) attractIndex = 0;
    }

    function updateBallColor()
    {
        for(var i = 0; i < basketballs.length; i++)
        {
            newBasketballs[i].material.subMaterials[1].ambientColor = playerData.team.colorRGB;
            newBasketballOutlines[i].material.ambientColor = playerData.team.colorRGB;
        }
    }

    function changeCamera() {
        currentCameraIndex++;
    }

    return scene;
}

var scene = createScene();
engine.runRenderLoop(function() {

    scene.render();
    var fpsLabel = document.getElementById("fpsLabel");
    fpsLabel.innerHTML = engine.getFps().toFixed()+ " fps";
    //fpsLabel.innerHTML = ISMASTER.toString();
    if(ISMASTER)
    {
        fpsLabel.style.background = "red";
        fpsLabel.style.height = "100%";
    }

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

// $passcodeInput.focus();

var myIP = getMyIP();

function getMyIP() {
  window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;//compatibility for Firefox and chrome
  var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};
  pc.createDataChannel('');//create a bogus data channel
  pc.createOffer(pc.setLocalDescription.bind(pc), noop);// create offer and set local description
  pc.onicecandidate = function(ice)
  {
   if (ice && ice.candidate && ice.candidate.candidate)
   {
    myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];

    // console.log('my IP: ', myIP);

    showCourt(myIP);

    pc.onicecandidate = noop;
   }
  };
}

function showCourt(someIP) {
  checkMyDeviceInfo(someIP);
}
function checkMyDeviceInfo(someIP) {
  // check if Device Knows What Court it should be in
  socket.emit('get court', someIP);
}
function haveCourtJoinRoom(courtname, roomnametojoin) {
  var data = {
    courtname: courtname,
    roomname: roomnametojoin
  }

  thisRoom = data.roomname;
  courtName = data.courtname;

  socket.emit('join room', data);

  updateUI();
}



function randomCode(howLong) {
  var randomname = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (var i = 0; i < howLong; i++)
    randomname += possible.charAt(Math.floor(Math.random() * possible.length));

  return randomname;
}
function randomRange (min, max) {
    var number = (Math.random() * (min - max) + max);
    return number;
}


function addScore() {
    currentNetState = netStates.WAITING;
    currentNetLerpDelayTime = initNetLerpDelayTime;

    if(currentGameState != gameStates.GAMEPLAY && currentGameState != gameStates.RESULTS) return;
    //console.log("SCORE ADDED");
    score++;
    UIGameplayUpdateScore(score);
    UIResultsUpdateScore(score);
    var scoreLabel = document.getElementById("scoreLabel");
    scoreLabel.innerHTML = "Score: " + score;
    playerData.score = score;

    combo++;
    console.log("Combo: " + combo);

}

function updateUI() {
    switch(currentGameState)
    {
        case gameStates.ATTRACT:
            score = 0;
            currentWaitTime = initWaitTime;
            hasplayer = false;
            scoreLabel.innerHTML = "";
            //attractLabel.innerHTML = "COURT CODE: <br /> " + courtName;
            UIAttractUpdateCourtName(courtName);
            attractLabel.innerHTML = "";
            currentGameTime = initGameTime;
            UIGameplayUpdateScore(0);
            UIAttractAnimateIn();
            break;
        case gameStates.WAITING:
            scoreLabel.innerHTML = "COURT CODE: " + courtName;
            // attractLabel.innerHTML = "COURT CODE: " + courtName; + " <br/>" + initWaitTime.toString();
            attractLabel.innerHTML = "";
            currentWaitTime = initWaitTime;
            UIAttractAnimateOut();
            break;
        case gameStates.GAMEPLAY:
            scoreLabel.innerHTML = "Score: " + score;
            //attractLabel.innerHTML = initGameTime.toString();
            break;
        case gameStates.RESULTS:
            UIGameplayAnimateOut();
            scoreLabel.innerHTML = "";
            //attractLabel.innerHTML = "Score: " + score;
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

function createCameraTypes() {
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
        initPos: new BABYLON.Vector3(0, -7, -18),
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

function gameOver() {
  // the game is finished, submit the score and do stuff

  var gamedata = {
    player: playerData,
    score: score,
    combo: combo
  }

  socket.emit('game over', gamedata);

  //Show Results page
}






socket.on('set master', function(){
    ISMASTER = true;
    console.log(ISMASTER);
});

socket.on('device knows court', function(data) {
  // do something with the data
  console.log('device knows court');
});
socket.on('device needs court', function() {
  // find something out
  console.log('Device doesnt know court');
});
socket.on('sync with master', function(syncData){
    masterData = syncData;
    readyToSync = true;
    console.log(masterData);
});


socket.on('join this room', function(data) {
  console.log('Court and Room Data: ');
  console.dir(data);

  var courtname = data.court.name;
  var roomname = data.room.name;

  console.log('told to join ' + courtname + ' in ' + roomname);

  haveCourtJoinRoom(courtname,roomname);
});
socket.on('court joined room', function(data) {
  console.log('Congrats ' + courtName +'(' + data.courtname + ')' + ', you joined room: ' + data.roomname);
})

socket.on('player joined court', function(userdata) {
    console.log('Player ' + userdata.username + ' - Joined Court - ' + userdata.court);
    UIGameplayUpdateName(userdata.username);
    UIResultsUpdateName(userdata.username);

    playerData = userdata;
    if (userdata.court == courtName) {
      hasplayer = true;
    }

    scene.actionManager.processTrigger(scene.actionManager.actions[2].trigger, {additionalData: "y"});
});
socket.on('player changed name', function(data) {
  console.log('Player ' + playerData.username + ' - Change Name - ' + data.newplayer.username);

  playerData = data.newplayer;

  UIGameplayUpdateName(playerData.username);
  UIResultsUpdateName(playerData.username);
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
socket.on('shot sent', function() {
  // console.log('We got a message back!');
})


socket.on('end all games', function(courtthatfinished) {
  console.log('court that finished - ' + courtthatfinished);

  //now end everything and send results
  gameOver();
});
socket.on('show results', function(resultsdata) {
  console.log('Results!');
  console.dir(resultsdata);
  UIResultsSetData(resultsdata);
});
socket.on('reset game', function() {
  scene.actionManager.processTrigger(scene.actionManager.actions[1].trigger, {additionalData: "t"});
});

socket.on('change player name', function(data) {

    UIGameplayUpdateName(data.name);
    console.log("CHANGE PLAYER NAME");
    console.log(data);
});




//To Delete Soon I think? (not needed?)

  function joinRoom() {
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

  function nameCourt() {
    return randomCode(5);
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

  socket.on('query', function(query) {
    console.log('query received - ' + query);

    joinQueryRoom(query);
  });
  socket.on('use random query', function() {
    console.log('no query received starting random');

    var query = randomCode(7);

    joinQueryRoom(query);
  });

//End of to delete soon I think
