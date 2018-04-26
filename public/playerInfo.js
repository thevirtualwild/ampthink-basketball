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

var primaryColor = "#ff3300";
var secondaryColor = "#ffffff";
var tertiaryColor = "#003399";

function generateColor()
{
    max = 3;
    var number = Math.floor((Math.random() * (-max) + max));
    var hexColor;

    switch(number)
    {
        case 0:
            hexColor = primaryColor;
            break;
        case 1:
            hexColor = secondaryColor;
            break;
        case 2:
            hexColor = tertiaryColor;
            break;
        default:
            hexColor = primaryColor;
    }

    return hexColor;
}
