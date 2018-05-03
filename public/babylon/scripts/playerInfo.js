var firstNames = ["Runny", "Buttercup", "Dinky", "Stinky", "Crusty",
    "Greasy","Gidget", "Cheesypoof", "Lumpy", "Wacky", "Tiny", "Flunky",
    "Fluffy", "Zippy", "Doofus", "Gobsmacked", "Slimy", "Grimy", "Salamander",
    "Oily", "Burrito", "Bumpy", "Loopy", "Snotty", "Irving", "Egbert"];


var lastNames = ["Snicker", "Buffalo", "Gross", "Bubble", "Sheep",
    "Corset", "Toilet", "Lizard", "Waffle", "Kumquat", "Burger", "Chimp", "Liver",
    "Gorilla", "Rhino", "Emu", "Pizza", "Toad", "Gerbil", "Pickle", "Tofu",
    "Chicken", "Potato", "Hamster", "Lemur", "Vermin"];

function generateName()
{
    max = firstNames.length;
    var number = Math.floor((Math.random() * (-max) + max));
    var firstName = firstNames[number];
    max = lastNames.length;
    number = Math.floor((Math.random() * (-max) + max));
    var name = firstName + " " + lastNames[number];
    return name;
}

var primaryTeam =
{
    name: 'Red',
    colorHex: '#ff3300',
    colorRGB: BABYLON.Color3.Red()
}

var secondaryTeam =
{
    name: 'White',
    colorHex: '#ffffff',
    colorRGB: BABYLON.Color3.White()
}
var tertiaryTeam =
{
    name: 'Blue',
    colorHex: '#003399',
    colorRGB: BABYLON.Color3.Blue()
}

function generateTeam()
{
    max = 3;
    var number = Math.floor((Math.random() * (-max) + max));
    var randTeam;

    switch(number)
    {
        case 0:
            randTeam = primaryTeam;
            break;
        case 1:
            randTeam = secondaryTeam;
            break;
        case 2:
            randTeam = tertiaryTeam;
            break;
        default:
            randTeam = primaryTeam;
    }

    return randTeam;
}
