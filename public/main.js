$(function() {
  // Main Controller Code
  var app = new PIXI.Application(window.innerWidth, window.innerHeight, {backgroundColor : 0x1099bb});
  document.body.appendChild(app.view);
  var socket = io();

  var $window = $(window);
  var $pages = $('.pages'); // Input for roomname
  var $passcodeInput = $('.passcodeInput'); // Input for roomname
  var $passcodePage = $('.passcode.page') // The roomchange page


  var gameStates = Object.freeze({"ATTRACT": 0, "WAITING": 1, "GAMEPLAY": 2, "RESULTS": 3});
  var currentGameState = gameStates.ATTRACT;

  var shotInfo;

  var basketball;// = new PIXI.Sprite(texture);
  var background;// = new PIXI.Sprite(backgroundTexture, app.screen.width, app.screen.height);
  var dragging = false;
  var thrown = true;
  var countdownStarted = true;

  var initCameraPos;

  var createScene = function()
  {
        var scene = new BABYLON.Scene(engine);
        engine.enableOfflineSupport = false;

        var physicsPlugin = new BABYLON.OimoJSPlugin(1);
        var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
        scene.enablePhysics(gravityVector, physicsPlugin);

        var camera = new BABYLON.FreeCamera("camera1", initCameraPos, scene);
        camera.attachControl(canvas, true);

        //camera.setTarget();
        scene.clearColor = BABYLON.Color3.Black();

        changeGameState(gameStates.ATTRACT);

        function changeGameState(gameState)
        {
            switch(gameState)
            {
                case gameStates.ATTRACT:
                    currentGameState = gameState;
                    updateUI();
                    break;
                case gameStates.WAITING:
                    currentGameState = gameState;
                    updateUI();
                    break;
                case gameStates.GAMEPLAY:
                    currentGameState = gameState;
                    break;
                case gameStates.RESULTS:
                    currentGameState = gameState;
                    break;
                default:
                    currentGameState = gameStates.ATTRACT;
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

        BABYLON.SceneLoader.ImportMesh("BASKET_BALL", "./assets/", "basketball3dtest.babylon", scene, function (mesh) {

            //var newBasketball;
            var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
            myMaterial.diffuseTexture = new BABYLON.Texture("./assets/basketball3dtestdiffuse.jpg", scene);
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
                newBasketball.scaling = new BABYLON.Vector3(0.05, 0.05, 0.05);
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
        backboard.scaling = new BABYLON.Vector3(17.5, 14, 1);
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
            //console.log(basketballs.length);
            if(basketballs[shotIndex].physicsImpostor) {
                basketballs[shotIndex].position = new BABYLON.Vector3(0, -20, -40);

                basketballs[shotIndex].physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
                basketballs[shotIndex].physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
                basketballs[shotIndex].physicsImpostor.applyImpulse(new BABYLON.Vector3(randomRange(-.3, .3), randomRange(26, 28), randomRange(17, 20)), basketballs[shotIndex].getAbsolutePosition());
            }

            shotIndex++;
            if(shotIndex>=basketballs.length) shotIndex = 0;
        }

        function changeCamera()
        {
            currentCameraIndex++;
        }

        return scene;
    }

  // include the web-font loader script
  //jshint ignore:start
  (function() {
    var wf = document.createElement('script');
    wf.src = ('https:' === document.location.protocol ? 'https' : 'http') +
    '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  })();
  // jshint ignore:end

  $passcodeInput.focus();

  basketball = new PIXI.Sprite(texture);
  background = new PIXI.Sprite(backgroundTexture, app.screen.width, app.screen.height);

  background.interactive = true;
  background.buttonMode = true;
  background.x = app.screen.width/2;
  background.y = app.screen.height/2;
  background.width = app.screen.width;
  background.height = app.screen.height;
  //background.alpha = 0;

  app.stage.addChild(background);
  background.anchor.set(0.5);

  console.log('creating basketball');
  createBasketball(100,150);

  function createBasketball(x, y) {
    app.stage.addChild(basketball);
    basketball.anchor.set(0.5);
    basketball.scale.set(0.3);
    console.log(app.screen.width);
    basketball.x = -100;
    basketball.y = app.screen.height/2;
    console.log('initial xy - ' + basketball.x + ',' + basketball.y);
  }

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      // $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13)
    {
      joinRoom();
    }

    if (event.which === 65) {
      // shotInfo = {
      //     exitX:0.5, //middle of screen
      //     exitY:-100,
      //     xSpeed:ratioX*totalSpeed/app.screen.width,
      //     ySpeed:ratioY*totalSpeed/app.screen.height,
      //     deviceWidth:app.screen.width,
      //     deviceHeight:app.screen.height
      // }

      shotInfo = {
        exitX: 350/app.screen.width,
        exitY: -100,
        xSpeed: 0/app.screen.width,
        ySpeed: 325/app.screen.height,
        deviceWidth: app.screen.width,
        deviceWidth: app.screen.height
      }

      socket.emit("throw ball", shotInfo);

      resetBall();
    }
    if (event.which === 66) {
      // shotInfo = {
      //     exitX:0.5, //middle of screen
      //     exitY:-100,
      //     xSpeed:ratioX*totalSpeed/app.screen.width,
      //     ySpeed:ratioY*totalSpeed/app.screen.height,
      //     deviceWidth:app.screen.width,
      //     deviceHeight:app.screen.height
      // }

      shotInfo = {
        exitX: 0/app.screen.width,
        exitY: -100,
        xSpeed: 410/app.screen.width,
        ySpeed: 326/app.screen.height,
        deviceWidth: app.screen.width,
        deviceWidth: app.screen.height
      }

      socket.emit("throw ball", shotInfo);

      resetBall();
    }
    if (event.which === 67) {
      // shotInfo = {
      //     exitX:0.5, //middle of screen
      //     exitY:-100,
      //     xSpeed:ratioX*totalSpeed/app.screen.width,
      //     ySpeed:ratioY*totalSpeed/app.screen.height,
      //     deviceWidth:app.screen.width,
      //     deviceHeight:app.screen.height
      // }

      shotInfo = {
        exitX: 468/app.screen.width,
        exitY: -100,
        xSpeed: -320/app.screen.width,
        ySpeed: 327/app.screen.height,
        deviceWidth: app.screen.width,
        deviceWidth: app.screen.height
      }

      socket.emit("throw ball", shotInfo);

      resetBall();
    }
    if (event.which === 68) {
      // shotInfo = {
      //     exitX:0.5, //middle of screen
      //     exitY:-100,
      //     xSpeed:ratioX*totalSpeed/app.screen.width,
      //     ySpeed:ratioY*totalSpeed/app.screen.height,
      //     deviceWidth:app.screen.width,
      //     deviceHeight:app.screen.height
      // }

      shotInfo = {
        exitX: 144/app.screen.width,
        exitY: -100,
        xSpeed: 300/app.screen.width,
        ySpeed: 327/app.screen.height,
        deviceWidth: app.screen.width,
        deviceWidth: app.screen.height
      }

      socket.emit("throw ball", shotInfo);

      resetBall();
    }

  });

  app.ticker.add(function(delta) {
    if (thrown == false) {
      if (dragging)
      TweenMax.to(basketball, 0.1, {y: historyY[0], x: historyX[0]});
    }
    else {
      basketball.rotation += 0.1 * delta;
    }
  });

  function joinRoom()
  {
    var roomtojoin;

    roomtojoin = cleanInput($passcodeInput.val().trim());

    // console.log('room to join - ',roomname);


    if (roomtojoin) {

      roomtojoin = roomtojoin.toUpperCase();

    } else {
      roomtojoin = 'GAME';
    }
    // fade out input page
    $pages.fadeOut();

    // make background interactive so you can drag and throw the ball (listeners)
    background
    .on('pointerdown', onDragStart)
    .on('pointerup', onDragEnd)
    .on('pointerupoutside', onDragEnd)
    .on('pointermove', onDragMove);

    // draw the text on screen (countdown and instructions)
    initText();

    name = 'boop';
    color = 'blue';

    userdata = {
      'username': name,
      'usercolor': color,
      'userroom': roomtojoin
    };

    console.log('Room name - ' + roomtojoin);

    // Tell the server your new room to connect to
    socket.emit('join room', roomtojoin);
    socket.emit('add user', userdata);
  }

  function initText()
  {
    countdownStarted = true;
    // create a text object with a nice stroke
    var textInstructions = new PIXI.Text('Score as many points as you can!', {
      fontWeight: 'bold',
      fontSize: 60,
      fontFamily: 'Arial',
      fill: '#FFFFFF',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 6
    });

    var textSwipe = new PIXI.Text('Swipe up to shoot', {
      fontWeight: 'bold',
      fontSize: 60,
      fontFamily: 'Arial',
      fill: '#FFFFFF',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 6
    });

    // setting the anchor point to 0.5 will center align the text... great for spinning!
    textSwipe.anchor.set(0.5);
    textSwipe.x = app.screen.width / 2;
    textSwipe.y = app.screen.height - 60;

    // setting the anchor point to 0.5 will center align the text... great for spinning!
    textInstructions.anchor.set(0.5);
    textInstructions.x = app.screen.width / 2;
    textInstructions.y = app.screen.height - 130;

    // create a text object that will be updated...
    var countingText = new PIXI.Text('3', {
      fontWeight: 'bold',
      fontSize: 200,
      fontFamily: 'Arial',
      fill: '#FFFFFF',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 7
    });

    countingText.x = app.screen.width / 2;
    countingText.y = 100;
    countingText.anchor.x = 0.5;

    app.stage.addChild(textInstructions, textSwipe, countingText);
    var count = 4;

    app.ticker.add(function() {

      if(countdownStarted)
      {
        count -= app.ticker.elapsedMS / 1000;
        // update the text with a new string
        countingText.text = Math.floor(count);
        countingText.anchor.set(0.5);
        if(count <= 0)
        {
          TweenMax.to(countingText, 0.2, {width: 0, height: 0});
          countingText.text = "0";
          countdownStarted = false;
          resetBall();
          startShooting();
        }
      }
    });


  }

  function onDragStart(event) {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    console.log("drag started");
    if(thrown == false) {
      this.data = event.data;
      this.dragging = true;
      dragging = true;
    }
  }

  function onDragEnd() {
    this.dragging = false;
    dragging = false;

    //detect if it's a swipe up

    if(this.data.getLocalPosition(this.parent).y - historyY[historyY.length - 1] < -30)
    {
      throwBall(historyX[historyX.length - 1], historyY[historyY.length - 1], this.data.getLocalPosition(this.parent).x, this.data.getLocalPosition(this.parent).y);
    }
    else if(this.data.getLocalPosition(this.parent).y - historyY[historyY.length - 1] > 30)
    {
      socket.emit("switch camera");
      console.log("swipe down");
    }
    else if(this.data.getLocalPosition(this.parent).x - historyX[historyX.length - 1] > 30)
    {
        socket.emit("load texture");
        console.log("swipe right");
    }
    this.data = null;
  }

  function onDragMove()
  {
    if (this.dragging) {
      var newPosition = this.data.getLocalPosition(this.parent);

      historyX.pop();
      historyX.unshift(newPosition.x);
      historyY.pop();
      historyY.unshift(newPosition.y);
    }
  }

  function throwBall(x1, y1, x2, y2)
  {
    thrown = true;
    var finalTweenPosX;
    var totalSpeed = 500;
    var duration;//duration
    var ratioX;
    var ratioY;

    //We travel at a rate of 5 pixels per unit ALWAYS
    var absDistance = (x1-x2) * (x1 - x2) + (y1-y2) * (y1 - y2);

    var distance = Math.sqrt(absDistance);
    //First we need to find the proportion of that which is vertical
    ratioY = (y1 - y2)/ distance;
    ratioX = Math.abs(x1-x2)/distance;
    totalYDistance = y2 + 100;

    //Then we find the time it takes to complete that vertical tween
    duration = totalYDistance / (ratioY * totalSpeed) ;

    //Then we add the final x drag position to the distance traveled which is found by multiplying the x rate proportion times the duration times the speed to find out the final X position
    //Then we pass that all in.
    if(x2>x1)
    {
      finalTweenPosX = x2 + duration * ratioX * totalSpeed;
    }
    else
    {
      finalTweenPosX = x2 - duration * ratioX * totalSpeed;
      ratioX = -ratioX;
    }

    shotInfo = {
      exitX:finalTweenPosX/app.screen.width,
      exitY:-100,
      xSpeed:ratioX*totalSpeed/app.screen.width,
      ySpeed:ratioY*totalSpeed/app.screen.height,
      deviceWidth:app.screen.width,
      deviceHeight:app.screen.height
    }

    TweenMax.to(basketball, duration, {y:-100, x:finalTweenPosX, onComplete:shotAttempt});

    console.log("throw ball");
  }

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

  function resetBall()
  {
    //thrown = false;
    basketball.x = -100;
    basketball.y = app.screen.height/2;
    TweenMax.to(basketball, 0.4, {x:app.screen.width/2, onComplete:canShoot});
    //basketball.y = app.screen.height/2;
  }

  function canShoot()
  {
    thrown = false;
  }

  function startShooting() {
    socket.emit('shooting started');
  }



  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).html();
  }

  socket.on('shooting finished', function(score) {
    console.log('Stop SHOOTING!!!! your score combined was - ' + score);
  });

  // socket.on('change color', function(data) {
  //   var texturenew = 'ball-orange.png';
  //   if (data == 'pink') {
  //     texturenew = 'ball-pink.png';
  //   } else if (data = 'mint') {
  //     texturenew = 'ball-mint.png';
  //   } else {
  //     console.log('no need to change color');
  //   }
  //   basketball.setTexture(texturenew);
  // });

  socket.on('user joined', function(data) {
    console.log('User Joined');
    console.dir(data);
  });

  socket.on('shot sent', function() {
    // console.log('We got a message back!');
  });

});
