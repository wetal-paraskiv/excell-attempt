function createTable(numOfRows, numOfCols) {

    const table = document.createElement('div');
    table.setAttribute('id', 'table');

    document.body.appendChild(table);

    const thead = createTableHead(numOfCols);
    table.appendChild(thead);
    let cellID = 0;
    for (let row = 0; row < numOfRows; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.setAttribute('class', 'table-row');
        const colIndex = document.createElement('div');
        colIndex.setAttribute('class', 'index-cell');
        const colIndexText = document.createTextNode(row + 1);
        colIndex.appendChild(colIndexText);
        rowDiv.appendChild(colIndex);
        table.appendChild(rowDiv);

        for (let col = 0; col < numOfCols; ++col) {
            const cell = document.createElement('input');
            cell.setAttribute('class', 'cell');
            cell.setAttribute('id', cellID);
            cellID = cellID + 1;

            // slugname to eval input formula by changing slugs with values
            const slug = String.fromCharCode(65 + col) + String(row + 1);
            cell.setAttribute('slug', slug);

            rowDiv.appendChild(cell);
        }
    }
    setEventListener(numOfCols);
}


function createTableHead(numOfCols) {
    const tableHead = document.createElement('div');
    tableHead.setAttribute('class', 'table-head');

    const headIndex = document.createElement('div');
    headIndex.setAttribute('class', 'index-cell');
    const headIndexText = document.createTextNode('Row/Col');
    headIndex.appendChild(headIndexText);

    tableHead.appendChild(headIndex);

    for (let i = 0; i < numOfCols; i++) {
        const headCell = document.createElement('div');
        headCell.setAttribute('class', 'index-cell');
        const headCellText = document.createTextNode(String.fromCharCode(65 + i));
        headCell.appendChild(headCellText);

        tableHead.appendChild(headCell);
    }
    return tableHead
}


function setEventListener(numOfCols) {
    const allCells = document.getElementsByClassName('cell');
    for (let cell of allCells) {

        cell.addEventListener('click', (event) => {
            const id = event.target.id;
            relocateCursor(id, 1);
        })

        cell.addEventListener("keyup", function(event) {

            if (event.keyCode == 37 && event.target.id > 0) {
                const precedentCellID = event.target.id;
                relocateCursor(parseInt(event.target.id) - 1, precedentCellID);

            } else if (event.keyCode == 38 && event.target.id >= numOfCols) {
                const precedentCellID = event.target.id;
                relocateCursor(parseInt(event.target.id) - numOfCols, precedentCellID);

            } else if (event.keyCode == 39 && event.target.id < allCells.length) {
                const precedentCellID = event.target.id;
                relocateCursor(parseInt(event.target.id) + 1, precedentCellID);

            } else if (event.keyCode == 40 || event.keyCode == 13 && event.target.id < (allCells.length - numOfCols)) {
                const precedentCellID = event.target.id;
                relocateCursor(parseInt(event.target.id) + numOfCols, precedentCellID);
            }
        });
    }
}


function relocateCursor(newID, precedentCellID) {

    document.getElementById(newID).focus();

    const allCells = document.getElementsByClassName('cell');
    for (const cell of allCells) {
        cell.style.background = 'white';
    }

    const activeCellID = document.activeElement.id;
    const activeCell = document.getElementById(activeCellID);
    activeCell.style.background = "#ffff99";

    if (activeCell.hasChildNodes()) {
        activeCell.value = activeCell.childNodes[0].textContent;
    }

    const precedentCell = document.getElementById(precedentCellID);
    if (precedentCell.value) {
        evaluateCell(precedentCell);
    } else {
        // delete atached formula if deleted cell value formula :)
        if (precedentCell.firstChild) {
            precedentCell.removeChild(precedentCell.firstChild);
        }
    }
}


function evaluateCell(cell) {
    const cellContent = cell.value;

    if (cellContent[0] == '=') {
        let formula = cellContent;
        const nodeFormula = document.createTextNode(formula);
        if (cell.firstChild) {
            cell.removeChild(cell.firstChild);
        }
        cell.appendChild(nodeFormula);

        const slugList = cellContent.slice(1).split(/\W/g); // by slugs
        const slugs = slugList.filter((elem) => elem != '')

        const operatorList = cellContent.slice(1).split(/\w/g); // by operators
        const operators = operatorList.filter((elem) => elem != '')

        const toEvaluate = changeSlugToVal(slugs, operators);
        try {
            cell.value = eval(toEvaluate);
        } catch (error) {
            cell.value = NaN;
        }
    }
}


function changeSlugToVal(slugs, operators) {
    let result = '';
    if (operators.length >= slugs.length) {
        for (let i = 0; i < slugs.length; i++) {
            const value = getCellValue(slugs[i]);
            if (value) {
                slugs[i] = value;
            }
            result += operators[i] + slugs[i];
        }
        return result
    } else {
        for (let i = 0; i < slugs.length; i++) {
            const value = getCellValue(slugs[i]);
            if (value) {
                slugs[i] = value;
            }
            result += slugs[i]
            if (operators[i]) {
                result += operators[i];
            }
        }
        return result
    }

}


function getCellValue(slug) {
    const allCells = document.getElementsByClassName('cell');
    for (let cell of allCells) {
        const cellSlug = cell.getAttribute('slug');
        if (cellSlug == slug) {
            return document.getElementById(cell.id).value;
        }
    }
}


function submitForm(submittedForm) {
    const numOfRows = parseInt(submittedForm.rows.value);
    const numOfCols = parseInt(submittedForm.columns.value);
    const oldTable = document.getElementById('table');
    if (oldTable) {
        console.log('remove old table');
        oldTable.remove();
    }
    createTable(numOfRows, numOfCols);
    return false
}