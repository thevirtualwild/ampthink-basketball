// Main Controller Code
var socket = io();

var canvas = document.getElementById("canvas");
var engine = new BABYLON.Engine(canvas, true);

var createScene = function(){
    // This creates a basic Babylon Scene object (non-mesh)
    var clientScene = new BABYLON.Scene(engine);

    clientScene.enablePhysics();
    engine.enableOfflineSupport = false;

    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), clientScene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), clientScene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    BABYLON.SceneLoader.ImportMesh("BASKET_BALL", "./assets/", "basketball3dtest.babylon", clientScene, function (mesh) {

        mesh[0].scaling = new BABYLON.Vector3(0.05, 0.05, 0.05);

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", clientScene);

        myMaterial.diffuseTexture = new BABYLON.Texture("./assets/basketball3dtestdiffuse.jpg", clientScene);
        //myMaterial.bumpTexture = new BABYLON.Texture("./assets/basketball3dtestbump.jpg", clientScene);
        mesh[0].material = myMaterial;

        var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 1.88, clientScene);
        sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, {mass: 1});
        sphere.position = new BABYLON.Vector3(0, 10, 10);

        clientScene.registerBeforeRender(function()
        {
            mesh[0].parent = sphere;
            //mesh[0].visible = false;
            if(sphere.position.y < -15)
            {
                sphere.position = new BABYLON.Vector3(
                    Math.random() * (-2 + 2) -2,
                    Math.random() * (15 - 13) +13,
                    Math.random() * (9 - 7) +7);
                //sphere.position.y = 12;
                sphere.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
                sphere.physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0,0,0));
            }
        });

    });

    BABYLON.SceneLoader.ImportMesh("", "./assets/", "bballnohooplowpoly.obj", clientScene, function (meshes) {

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", clientScene);
        var mesh;

        for(var i = 0; i < meshes.length; i++)
        {
            myMaterial.diffuseTexture = new BABYLON.Texture("./assets/basketball_hoop_diffuse_noAO.jpg", clientScene);
            //myMaterial.bumpTexture = new BABYLON.Texture("./assets/basketball3dtestbump.tga", clientScene);
            meshes[i].material = myMaterial;
            meshes[i].position = new BABYLON.Vector3(0, -10, 17);
            meshes[i].scaling = new BABYLON.Vector3(0.025, 0.02, 0.025);
            meshes[i].rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.WORLD);

            var hoop = meshes[i];
            hoop.physicsImpostor = new BABYLON.PhysicsImpostor(hoop, BABYLON.PhysicsImpostor.MeshImpostor, {
                mass: 0,
                friction: 1,
                restitution: 3
            });
        }
    });

    return clientScene;
}


var clientScene = createScene();



engine.runRenderLoop(function(){
    clientScene.render();
    var fpsLabel = document.getElementById("fpsLabel");
    fpsLabel.innerHTML = engine.getFps().toFixed() + " fps";
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
