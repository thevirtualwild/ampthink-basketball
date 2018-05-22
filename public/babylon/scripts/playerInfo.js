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
    colorHex: 'cc0000',
    colorR: 204,
    colorG: 0,
    colorB: 0
}

var secondaryTeam =
{
    name: 'White',
    colorHex: '#ffffff',
    colorR: 255,
    colorG: 255,
    colorB: 255
}
var tertiaryTeam =
{
    name: 'Blue',
    colorHex: '#1967a3',
    colorR: 25,
    colorG: 103,
    colorB: 163
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
