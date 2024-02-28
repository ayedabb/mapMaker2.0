/* 
    TODO

    make it so you can see the images when you loadXML, the values ARE there, but theyre not showing


*/

let selectedImage = "img/floor.png";

// create eventlistener for block selection, updates selected Image
const radioButtons = document.querySelectorAll("input[type=radio]");
radioButtons.forEach(button => {
    button.addEventListener("click", function (e) {
        selectedImage = `${button.value}`;
    });
});

document.querySelectorAll('.grid-size').forEach(num => { num.addEventListener("change", (e) => {

    if(e.target.value < 8) { e.target.value=8;}
    else if (e.target.value > 32 ) { e.target.value = 32;}
})});

// eventlistener for generategrid button
document.querySelector("#gridGenerateButton").addEventListener("click", generateGrid);

// function to create grid
function generateGrid() {
    let x = document.getElementById("xCoord").value;
    let y = document.getElementById("yCoord").value;
    let gridContainer = document.getElementById("gridContainer");
    gridContainer.innerHTML = "";

    for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
            let gridCell = document.createElement("div");
            gridCell.className = "grid-cell";
            gridCell.style.backgroundImage = getInitialBackgroundImage(i, j, x, y);
            gridCell.dataset.image = "floor"; // default to "floor"
            if(!gridCell.style.backgroundImage.includes("img/wall.png")){
                gridCell.addEventListener("click", changeImage);
            }
            gridContainer.appendChild(gridCell);
        }
        gridContainer.appendChild(document.createElement("br"));
    }
}

function getInitialBackgroundImage(row, col, x, y) {
    if (row === 0 || col === 0 || row === y - 1 || col === x - 1) {
        return "url('img/wall.png')";
    } else {
        return "url('img/floor.png')";
    }
}

function changeImage(event) {
    let newImage = selectedImage.substring(0, selectedImage.indexOf('.'));
    let oldImage = event.target.dataset.image;
    event.target.style.backgroundImage = (oldImage === newImage) ? 'url(img/floor.png)' : `url(img/${newImage}.png)`;
    event.target.dataset.image = (oldImage === newImage) ? 'floor' : newImage;
}

function saveToXML() {
    let levelNumber = document.getElementById("levelNumber").value;

    const tanks = [
        "player",
        "blue",
        "cyan",
        "orange",
        "purple",
        "red",
        "yellow",
        "boss"
      ];

    let xmlString = '<?xml version="1.0" encoding="UTF-8" ?>\n';
    xmlString += '<level>\n';
    xmlString += '<levelName name="' + document.getElementById("levelNumber").value + '"></levelName>\n'
    xmlString += '<levelSeed seed="' + Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('') + '"></levelSeed>\n';
    xmlString += '\t<grid x="' + document.getElementById("xCoord").value + '" y="' + document.getElementById("yCoord").value + '"></grid>\n';
    xmlString += '\t<objects>\n';

    let gridCells = document.querySelectorAll('.grid-cell');
    gridCells.forEach(function (gridCell, index) {
        let x = index % parseInt(document.getElementById("xCoord").value);
        let y = Math.floor(index / parseInt(document.getElementById("xCoord").value));

        let imageName = gridCell.dataset.image;

        if (imageName !== "wall" && imageName !== "floor" && imageName !== "undefined" && !tanks.includes(imageName)) {
            let type = imageName;
            
            if (type + "" !== "undefined") {
                xmlString += '\t\t<coord x="' + x + '" y="' + y + '" type="' + type + '"></coord>\n';
            }
            
        }
    });

    xmlString += '\t</objects>\n';

    xmlString += '\t<enemies>\n';

    gridCells.forEach(function (gridCell, index) {
        let x = index % parseInt(document.getElementById("xCoord").value);
        let y = Math.floor(index / parseInt(document.getElementById("xCoord").value));

        let imageName = gridCell.dataset.image;

        if (imageName !== "wall" && imageName !== "floor" && imageName !== "undefined" && tanks.includes(imageName)) {
            let type = imageName;
            
            if (type + "" !== "undefined") {
                if (type == "player") {
                    xmlString += '\t\t<tank x="' + x + '" y="' + y + '" type="p1"></tank>\n';
                } else {
                    xmlString += '\t\t<enemy x="' + x + '" y="' + y + '" type="' + type + '"></enemy>\n';
                }
            }
            
        }
    });

    xmlString += '\t</enemies>\n';

    xmlString += '</level>';

    let blob = new Blob([xmlString], {type: 'text/xml'});
    let a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = levelNumber + '.xml';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function loadFromXML(files) {
    let file = files[0];

    if (file) {
        let reader = new FileReader();

        reader.onload = function (e) {
            let xmlContent = e.target.result;
            parseXML(xmlContent);
        };

        reader.readAsText(file);
    }
}

function parseXML(xmlContent) {
    let xmlDoc = new DOMParser().parseFromString(xmlContent, 'text/xml');
    let gridNode = xmlDoc.querySelector('grid');
    let x = gridNode.getAttribute('x');
    let y = gridNode.getAttribute('y');

    let objectsNode = xmlDoc.querySelector('objects');
    let coords = Array.from(objectsNode.querySelectorAll('coord'));
    let enemiesNode = xmlDoc.querySelector('enemies');
    enemies = Array.from(enemiesNode.querySelectorAll('enemy'));
    
    let tanks = Array.from(enemiesNode.querySelectorAll('tank'));

    let mergedArray = coords.concat(enemies).concat(tanks);

    let gridContainer = document.getElementById('gridContainer');
    gridContainer.innerHTML = '';

    for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
            let gridCell = document.createElement('div');
            gridCell.className = 'grid-cell';
            gridCell.style.backgroundImage = getInitialBackgroundImage(i, j, x, y);

            mergedArray.forEach(function (coord) {
                if (coord.getAttribute('x') == j && coord.getAttribute('y') == i) {
                    let type = coord.getAttribute('type');

                    if (type == "p1") {
                        type = "player"
                    }

                    // console.log(type + " at [" + j + ", " + i + "]")
                    gridCell.dataset.image = type;
                    gridCell.style.backgroundImage = `url('img/${type}.png')`;

                }
            });

            gridCell.addEventListener('click', changeImage);
            gridContainer.appendChild(gridCell);
        }

        gridContainer.appendChild(document.createElement('br'));
    }
}
