  var socket = io();

  var canvas = document.getElementById("canvas");
  var engine = new BABYLON.Engine(canvas, true, null, false);

  var shotInfo;

  var basketball;
  var dragging = false;
  var shot = false;
  var thrown = true;
  var countdownStarted = true;

  var initCameraPos;

  var ballStates = Object.freeze({"WAITING": 0, "DRAGGABLE": 1, "DRAGGING": 2, "SHOT": 3});
  var currentBallState = ballStates.WAITING;

  var createScene = function()
  {
    var scene = new BABYLON.Scene(engine);
    engine.enableOfflineSupport = false;

    var physicsPlugin = new BABYLON.OimoJSPlugin(1);
    var gravityVector = new BABYLON.Vector3(0, 0, 0);
    scene.enablePhysics(gravityVector, physicsPlugin);

    initCameraPos = new BABYLON.Vector3(0,10,0);
    initCameraFocus = new BABYLON.Vector3(0,0,0);
    var camera = new BABYLON.FreeCamera("camera1", initCameraPos, scene);
    //camera.attachControl(canvas, true);

    camera.setTarget(initCameraFocus);
    scene.clearColor = BABYLON.Color3.Black();

    var targetVec;
    var targetVecNorm;
    var initVec;

    var distVec;

    var ground = BABYLON.Mesh.CreateGround("ground1", 35, 35, 1, scene);
      var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
      myMaterial.emissiveTexture = new BABYLON.Texture("/babylon/assets/FillrateTexture.png", scene);
      ground.material = myMaterial;
    var basketball;

    scene.ambientColor = new BABYLON.Color3(1,1,1);

    BABYLON.SceneLoader.ImportMesh("", "/babylon/assets/BBall_V2/", "BBall_V2.babylon", scene, function (mesh)
    {
        var baseMaterial = new BABYLON.StandardMaterial("baseMaterial", scene);
        var overlayMaterial = new BABYLON.StandardMaterial("overlayMaterial", scene);
        var multimat = new BABYLON.MultiMaterial("multi", scene);

        baseMaterial.emissiveTexture = new BABYLON.Texture("babylon/assets/BBall_V2/BBall_V2_Albedo.png", scene);
        baseMaterial.diffuseTexture = new BABYLON.Texture("babylon/assets/BBall_V2/BBall_V2_Albedo.png", scene);
        baseMaterial.diffuseTexture.hasAlpha = true;

        overlayMaterial.ambientColor = new BABYLON.Color3(1,.4,.2);

        multimat.subMaterials.push(baseMaterial);
        multimat.subMaterials.push(overlayMaterial);

        basketball = mesh[0];
        basketball.material = multimat;

        basketball.position = new BABYLON.Vector3(-10, 0, 0);
        basketball.isPickable = false;
        basketball.physicsImpostor = new BABYLON.PhysicsImpostor(basketball, BABYLON.PhysicsImpostor.SphereImpostor,
        {
            mass: 1,
            friction:0.1,
            ignoreParent: true
        });

        scene.registerBeforeRender(function()
        {
            scene.onPointerDown = function (evt, pickResult)
            {
                if(currentBallState == ballStates.DRAGGABLE)
                {
                    currentBallState = ballStates.DRAGGING;
                }
            };

            scene.onPointerUp = function (evt, pickResult)
            {
                if(currentBallState == ballStates.DRAGGING)
                {
                    if (basketball.physicsImpostor.getLinearVelocity().z > 5)
                    {
                        takeShot();
                    }
                    else
                    {
                        currentBallState = ballStates.DRAGGABLE;
                    }
                }
            };

            if(currentBallState == ballStates.DRAGGABLE)
            {
                var vel = basketball.physicsImpostor.getLinearVelocity();
                vel.x*= .96;
                vel.y*= .96;
                vel.z*= .96;
                basketball.physicsImpostor.setLinearVelocity(vel);
                var convertedRot = new BABYLON.Vector3(0,0,0);
                var velocity = basketball.physicsImpostor.getLinearVelocity();
                convertedRot.x = velocity.z;
                convertedRot.z = -velocity.x;
                basketball.physicsImpostor.setAngularVelocity(convertedRot);
            }
            else if(currentBallState == ballStates.DRAGGING)
            {
                //console.log(info.pickInfo);
                basketball.position.y = 0;
                var objectPicked = scene.pick(scene.pointerX, scene.pointerY);
                var pickedPoint = objectPicked.pickedPoint;
                if (objectPicked.pickedMesh == ground) {

                    targetVec = pickedPoint;
                    initVec = basketball.position.clone();

                    distVec = BABYLON.Vector3.Distance(targetVec, initVec);
                    if(distVec < .5)
                    {
                        basketball.physicsImpostor.setLinearVelocity(
                            basketball.physicsImpostor.getLinearVelocity.x/2,
                            0,
                            basketball.physicsImpostor.setLinearVelocity.z/2);

                        basketball.physicsImpostor.setAngularVelocity(
                            basketball.physicsImpostor.getLinearVelocity.x/2,
                            0,
                            basketball.physicsImpostor.setLinearVelocity.z/2);
                        return;
                    }
                    targetVec = targetVec.subtract(initVec);
                    targetVecNorm = BABYLON.Vector3.Normalize(targetVec);
                    basketball.physicsImpostor.setLinearVelocity(0,0,0);
                    targetVecNorm.x *=10;
                    targetVecNorm.z *=10;
                    var convertedRot = new BABYLON.Vector3(0,0,0);
                    var pushPos = basketball.position;
                    basketball.applyImpulse(targetVecNorm, pushPos);
                    var velocity = basketball.physicsImpostor.getLinearVelocity();
                    convertedRot.x = velocity.z;
                    convertedRot.z = -velocity.x;
                    basketball.physicsImpostor.setAngularVelocity(convertedRot);
                }

            }
            else if(currentBallState == ballStates.SHOT)
            {
                if(basketball.position.z > 6)
                {
                    shotInfo = {

                             xSpeed:basketball.physicsImpostor.getLinearVelocity().x,
                             ySpeed:basketball.physicsImpostor.getLinearVelocity().z,
                             deviceWidth:canvas.width,
                             deviceHeight:canvas.height
                         };
                    socket.emit("throw ball", shotInfo);

                    resetBall();
                }
            }
            else if(currentBallState == ballStates.WAITING)
            {
                if(basketball.position.x > -4)
                {
                    currentBallState = ballStates.DRAGGABLE;
                }
            }
        });

    });

    function takeShot()
    {
        currentBallState = ballStates.SHOT;
        var vel = basketball.physicsImpostor.getLinearVelocity();
        vel.z *= 2;
        vel.y = 10;
        basketball.physicsImpostor.setLinearVelocity(vel);
        vel.x = -30;
        vel.y = 0;
        vel.z = 0;
        basketball.physicsImpostor.setAngularVelocity(vel);
        /*
        basketball.physicsImpostor.setAngularVelocity(0,0,0);
        basketball.physicsImpostor.setLinearVelocity(0,0,0);
        basketball.physicsImpostor.applyImpulse(new BABYLON.Vector3(5, 0, 0), basketball.position);
        var convertedRot = new BABYLON.Vector3(0,0,0);
        var velocity = basketball.physicsImpostor.getLinearVelocity();
        convertedRot.x = velocity.z;
        convertedRot.z = -velocity.x;
        basketball.physicsImpostor.setAngularVelocity(convertedRot);
        */
    }

    function resetBall()
    {
        currentBallState = ballStates.WAITING;
        basketball.position = new BABYLON.Vector3(-10, 0, 0);
        basketball.physicsImpostor.setAngularVelocity(0,0,0);
        basketball.physicsImpostor.setLinearVelocity(0,0,0);
        basketball.physicsImpostor.applyImpulse(new BABYLON.Vector3(10, 0, 0), basketball.position);
        var convertedRot = new BABYLON.Vector3(0,0,0);
        var velocity = basketball.physicsImpostor.getLinearVelocity();
        convertedRot.x = velocity.z;
        convertedRot.z = -velocity.x;
        basketball.physicsImpostor.setAngularVelocity(convertedRot);
    }

    function resetGame()
    {
        currentBallState = ballStates.WAITING;
        console.log("RESET");
        basketball.position = new BABYLON.Vector3(-10, 0, 0);
        basketball.physicsImpostor.setAngularVelocity(0,0,0);
        basketball.physicsImpostor.setLinearVelocity(0,0,0);
    }

      scene.actionManager = new BABYLON.ActionManager(scene);

      scene.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
              {
                  trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                  additionalData: 'r'
              },

              function ()
              {
                  resetBall();
              }
          )
      );

      scene.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
              {
                  trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                  additionalData: 't'
              },

              function ()
              {
                  resetGame();
              }
          )
      );

    return scene;
}


var scene = createScene();

engine.runRenderLoop(function(){

  scene.render();
});

var $window = $(window);
var $pages = $('.pages'); // Input for roomname
var $gameover = $('#gameover');
var $passcodeInput = $('.passcodeInput'); // Input for roomname
var $usernameInput = $('.usernameInput');
var $passcodePage = $('.passcode.page'); // The roomchange page

//(function() {
  var wf = document.createElement('script');
  wf.src = ('https:' === document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
  wf.type = 'text/javascript';
  wf.async = 'true';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(wf, s);
//})();
// jshint ignore:end

$gameover.fadeOut();
$usernameInput.focus();

$window.keydown(function (event)
{
  // When the client hits ENTER on their keyboard
  if (event.which === 13)
  {
      initializePlayer();
  }
});

function initializePlayer() {
  var courttojoin;
  courttojoin = cleanInput($passcodeInput.val().trim());

  joinCourt(courttojoin);
}

socket.on('game almost ready', function(courtName)
{
    //fade out customization screen
    //roll in ball;

    var ae = BABYLON.ActionEvent.CreateNewFromScene(scene, {additionalData: "r"});
    //console.log(ae);
    scene.actionManager.processTrigger(scene.actionManager.actions[0].trigger,  ae);
});

socket.on('end player game', function()
{
    console.log('Player Game Ended');
    //show this players score
    $gameover.fadeIn();
    var ae = BABYLON.ActionEvent.CreateNewFromScene(scene, {additionalData: "t"});
    //console.log(ae);
    scene.actionManager.processTrigger(scene.actionManager.actions[1].trigger,  ae);
    //$passcodeInput.text = "";
    //scene.actionManager.processTrigger(scene.actionManager.actions[1].trigger, {additionalData: "t"});
});

function joinCourt(someCourt)
{
  var username = generateName();
  var team = generateTeam();
  // if (username) {
  //   username = username.toUpperCase();
  // } else {
  //   username = generateName();
  // }
  var courttojoin = someCourt;
  if (courttojoin) {
      courttojoin = courttojoin.toUpperCase();
  } else {
      courttojoin = 'GAME';
  }
  // fade out input page
  $pages.fadeOut();

  userdata = {
      'username': username,
      'team': team,
      'court': courttojoin
  };

  console.log('Court name - ' + courttojoin);
  // Tell the server your new room to connect to
  socket.emit('join court', userdata);
  // socket.emit('add user', userdata);
}

function cleanInput (input) {
  return $('<div/>').text(input).html();
}
