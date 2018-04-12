// Main Controller Code
var socket = io();

var canvas = document.getElementById("canvas");
var engine = new BABYLON.Engine(canvas, true);
var useMeshCollision = false;
var useCannon = true;
var cameraTypes = Object.freeze({"freeThrow": 0, "quarterFar": 1, "close": 2});
var selectedCameraType = cameraTypes.freeThrow;

var createScene = function(){
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    if(useCannon) {
        var physicsPlugin = new BABYLON.CannonJSPlugin(true, 5);
        physicsPlugin.setTimeStep(0.1);
    }
    else
    {
        var physicsPlugin = new BABYLON.OimoJSPlugin(2);

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
        initCameraPos = new BABYLON.Vector3(8, 0, -4);
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
                /*
                sphere.position = new BABYLON.Vector3(
                    Math.random() * (-2 + 2) -2,
                    Math.random() * (15 - 13) +13,
                    Math.random() * (9 - 7) +7);
                //sphere.position.y = 12;
                basketball.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0,0,0));
                basketball.physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0,0,0));
                */
                takeShot();
            }
        });
    });

    BABYLON.SceneLoader.ImportMesh("", "./assets/", "bballnohooplowpoly.obj", scene, function (meshes) {

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
        var mesh;

        for(var i = 0; i < meshes.length; i++)
        {
            myMaterial.diffuseTexture = new BABYLON.Texture("./assets/basketball_hoop_diffuse_noAO.jpg", scene);
            //myMaterial.bumpTexture = new BABYLON.Texture("./assets/basketball3dtestbump.tga", scene);
            meshes[i].material = myMaterial;
            meshes[i].position = new BABYLON.Vector3(1.25, -10, 17);
            meshes[i].scaling = new BABYLON.Vector3(0.025, 0.02, 0.025);
            meshes[i].rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.WORLD);

            if(useMeshCollision) {
                hoop.physicsImpostor = new BABYLON.PhysicsImpostor(hoop, BABYLON.PhysicsImpostor.MeshImpostor, {
                    mass: 0,
                    friction: 1,
                    restitution: 3
                });
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

   // console.log(backboard.position);
    //console.log(backboard.absolutePosition);

    //camera.setTarget(backboard.position);


    scene.actionManager = new BABYLON.ActionManager(scene);

    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            {
                trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                parameter: 'r'
            },

            function () {
                takeShot();
            }
        )
    );

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

// create a texture from an image path
//var texture = PIXI.Texture.fromImage('basketball.png');
//var backgroundTexture= PIXI.Texture.fromImage('BasketballBackground.jpg');
//from here http://www.zgjm-org.com/data/out/6/IMG_112426.jpg

var shotInfo;

//texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
//var basketball;// = new PIXI.Sprite(texture);
//var background;// = new PIXI.Sprite(backgroundTexture, app.screen.width, app.screen.height);
var dragging = false;
var thrown = true;
var countdownStarted = true;

$passcodeInput.focus();

/*
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
*/
createBasketball(0,0);

function createBasketball(x, y) {

}

joinRoom();

// $window.keydown(function (event) {
//     // Auto-focus the current input when a key is typed
//     if (!(event.ctrlKey || event.metaKey || event.altKey)) {
//         // $currentInput.focus();
//     }
//     // When the client hits ENTER on their keyboard
//     if (event.which === 13)
//     {
//             joinRoom();
//     }
// });

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

/*
function onDragStart(event) {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    console.log("drag started");

    this.data = event.data;
    this.dragging = true;
    dragging = true;
    this.anchor.set(0.5);

    while(historyX.length > 0)
    {
        historyX.pop();
    }

    while(historyY.length > 0)
    {
        historyY.pop();
    }

    var newPosition = this.data.getLocalPosition(this.parent);

    for( var i = 0; i < historySize; i++)
    {
        historyX.push(newPosition.x);
        historyY.push(newPosition.y);
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
        exitX:finalTweenPosX,
        exitY:-100,
        xSpeed:ratioX*totalSpeed,
        ySpeed:ratioY*totalSpeed
    }

    TweenMax.to(basketball, duration, {y:-100, x:finalTweenPosX, onComplete:shotAttempt});

    console.log("throw ball");
}
*/

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
  //basketball.x = -100;
  //basketball.y = app.screen.height/2;
  //TweenMax.to(basketball, 0.4, {x:app.screen.width/2, onComplete:canShoot});
  //basketball.y = app.screen.height/2;
}

function canShoot()
{
    thrown = false;
}

socket.on('shot sent', function() {
  // console.log('We got a message back!');
})
