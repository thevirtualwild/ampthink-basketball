// Main Controller Code
var socket = io();

var canvas = document.getElementById("canvas");
var engine = new BABYLON.Engine(canvas, true);
var useMeshCollision = false;
var useCannon = false;

var cameraTypes = Object.freeze({"freeThrow": 0, "quarterFar": 1, "close": 2});
var selectedCameraType = cameraTypes.close;
//console.log(engine.texturesSupported);
var currentCameraIndex = 0;
var currentTextureIndex = 0;
for(var i = 0; i < engine.texturesSupported.length; i++)
{
    //console.log("Supported Texture: " + engine.texturesSupported[i]);
}

var createScene = function(){
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    if(useCannon) {
        var physicsPlugin = new BABYLON.CannonJSPlugin(true, 5);
        physicsPlugin.setTimeStep(0.1);
    }
    else
    {
        var physicsPlugin = new BABYLON.OimoJSPlugin(1);
        physicsPlugin.allowSleep = true;
        console.log(physicsPlugin.setTimeStep(0.55));
        console.log(physicsPlugin.getTimeStep());

    }

    var gravityVector = new BABYLON.Vector3(0,-15.81, 0);
    scene.enablePhysics(gravityVector, physicsPlugin);

    engine.enableOfflineSupport = false;

    var initCameraPos;
    var initCameraFocus;

    // This creates and positions a free camera (non-mesh)
    if(selectedCameraType == cameraTypes.quarterFar)
    {
        initCameraPos = new BABYLON.Vector3(50, 5, -25);
        initCameraFocus = new BABYLON.Vector3(0, -2.6, 11.75);
    }
    else if(selectedCameraType == cameraTypes.freeThrow)
    {
        initCameraPos = new BABYLON.Vector3(0, -15, -40);
        initCameraFocus = new BABYLON.Vector3(0, -8, 11.75);
    }
    else if(selectedCameraType == cameraTypes.close)
    {
        initCameraPos = new BABYLON.Vector3(-1, -6, -1);
        initCameraFocus = new BABYLON.Vector3(0, -2.6, 11.75);
    }

    var camera = new BABYLON.FreeCamera("camera1", initCameraPos, scene);
    camera.setTarget(initCameraFocus);
    // This targets the camera to scene origin


    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    BABYLON.SceneLoader.ImportMesh("", "./assets/", "Frame_Geo.babylon", scene, function (mesh)
    {

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        myMaterial.diffuseTexture = new BABYLON.Texture("./assets/FillrateTexture.png", scene);
        myMaterial.diffuseTexture.hasAlpha = false;
        //myMaterial.bumpTexture = new BABYLON.Texture("./assets/basketball3dtestbump.jpg", scene);
        mesh[0].material = myMaterial;
        mesh[0].position = new BABYLON.Vector3(-50, -50, 0);

    });

    BABYLON.SceneLoader.ImportMesh("", "./assets/", "Frame_Solid.babylon", scene, function (mesh)
    {

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        myMaterial.diffuseTexture = new BABYLON.Texture("./assets/FillrateTexture.png", scene);
        myMaterial.diffuseTexture.hasAlpha = true;
        myMaterial.alpha = 0;
        //myMaterial.bumpTexture = new BABYLON.Texture("./assets/basketball3dtestbump.jpg", scene);
        mesh[0].material = myMaterial;
        mesh[0].position = new BABYLON.Vector3(-40, -50, 0);


    });

    BABYLON.SceneLoader.ImportMesh("", "./assets/", "Frame_Solid.babylon", scene, function (mesh)
    {

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        myMaterial.diffuseTexture = new BABYLON.Texture("./assets/FillrateTexture.png", scene);
        myMaterial.diffuseTexture.hasAlpha = false;
        //myMaterial.bumpTexture = new BABYLON.Texture("./assets/basketball3dtestbump.jpg", scene);
        mesh[0].material = myMaterial;
        mesh[0].position = new BABYLON.Vector3(-30, -50, 0);


    });

    var basketball = BABYLON.Mesh.CreateSphere("basketball", 16, 1.88, scene);

    //var myMaterial = new BABYLON.CellMaterial("CellMaterial", scene);

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
                //takeShot();
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
                meshes[i].material = myMaterial;
                //console.log(i);
                //console.log(meshes[i].name);
                //console.log(meshes[i].getAbsolutePosition());
                meshes[i].position = new BABYLON.Vector3(0, -36.1, 17);
                //meshes[i].scaling = new BABYLON.Vector3(0.025, 0.02, 0.025);
                //meshes[i].rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.WORLD);

                if (useMeshCollision) {
                    hoop.physicsImpostor = new BABYLON.PhysicsImpostor(hoop, BABYLON.PhysicsImpostor.MeshImpostor, {
                        mass: 0,
                        friction: 1,
                        restitution: 3
                    });
                }
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

    if(!useMeshCollision)
    {
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
    }

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
    //net.position = netSpheres[0].position;
    //var net = BABYLON.Mesh.CreateCylinder("ground1", 5, 4, 2.5, 30, sphereAmount - 1, scene, true);
    //net.position = netSpheres[0].position;
    var positions = net.getVerticesData(BABYLON.VertexBuffer.PositionKind);

    net.material = clothMat;

    var indices = net.getIndices();

    console.log(netSpheres.length);
    console.log(indices.length);
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
                takeShot();
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
                additionalData: 'y'
            },

            function () {
                loadTexture();
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
            //console.log(basketball.getAbsolutePosition());
            //console.log(basketball.physicsImpostor.getAngularVelocity());
            basketball.physicsImpostor.applyImpulse(new BABYLON.Vector3(randomRange(-.4, .4), randomRange(21, 23), randomRange(15, 17)), basketball.getAbsolutePosition());
        }
    }

    function changeCamera()
    {
        currentCameraIndex++;

        if(currentCameraIndex % 3  == 0)
        {
            //camera.position = new BABYLON.Vector3(50, 5, -25);
            //camera.setTarget(new BABYLON.Vector3(0, -2.6, 11.75));

            camera.position = new BABYLON.Vector3(-50, -50,-2);
            camera.setTarget(new BABYLON.Vector3(-50, -50, 0));
        }
        else if(currentCameraIndex % 3  == 1)
        {
            //camera.position = new BABYLON.Vector3(0, -15, -40);
            //camera.setTarget(new BABYLON.Vector3(0, -8, 11.75));
            camera.position = new BABYLON.Vector3(-40, -50, -2);
            camera.setTarget(new BABYLON.Vector3(-40, -50, 0));
        }
        else if(currentCameraIndex % 3  ==2)
        {
            //camera.position = new BABYLON.Vector3(-1, -6, -1);
            //camera.setTarget(new BABYLON.Vector3(0, -2.6, 11.75));
            camera.position = new BABYLON.Vector3(-30, -50, -2);
            camera.setTarget(new BABYLON.Vector3(-30, -50, 0));
        }
    }

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

    return scene;
}

var scene = createScene();

engine.runRenderLoop(function(){
    scene.render();
    var fpsLabel = document.getElementById("fpsLabel");
    fpsLabel.innerHTML = engine.getFps().toFixed()+ " fps";

    //console.log("render");
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
