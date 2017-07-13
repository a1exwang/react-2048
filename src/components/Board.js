import React from 'react';
import {keyCodes} from '../constants';
import {
    calcGridSpacing, 
    calcCellHeight,
    calcCellWidth
} from '../utils';
import Tile from './tile';

// Board controls how the tile being moved
export default class Board extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            board: this.emptyBoard(this.props.gridSize, this.props.rows, this.props.cols)
        }

        this.keyDownHandler = this.keyDownHandler.bind(this);
    }

    componentWillMount () {
        document.addEventListener('keydown', this.keyDownHandler, true);
    }

    componentDidMount () {
        this.setState({
            board: this.initialBoard()
        });
    }

    componentWillUnmount () {
        document.removeEventListener('keydown', this.keyDownHandler, true);
    }

    // for test
    keyDownHandler (event) {
        const key = event.keyCode;
        let step = {x: 0, y: 0};
        if (key === 37) {
            step.x = -1;
        } else if (key === 38) {
            step.y = -1;
        } else if (key === 39) {
            step.x = 1;
        } else if (key === 40) {
            step.y = 1;
        }

        this.moveTile(step);
    }

    moveTile(step) {
        let board = this.state.board;
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[0].length; j++) {
                if (board[i][j].tile && board[i + step.y] && board[i + step.y][j + step.x]) {
                    board[i + step.y][j + step.x].tile = createTile(board[i + step.y][j + step.x].cell, false);
                    board[i][j].tile = null;
                }
            }
        }

        this.setState({
            board: board
        });
    }

    initialBoard () {
        let board = this.state.board;
        let cells = this.availableCells();
        for (let i = 0; i < this.props.startTiles; i++) {
            let pos = this.randomAvailableCell(cells);
            if (pos !== null) {
                let cell = board[pos.row][pos.col];
                board[pos.row][pos.col] = Object.assign(cell, {tile: this.createTile(cell, true)});
            }
        }

        return board;
    }

    randomCellValue () {
        return Math.random() > 0.9 ? 4 : 2;
    }

    randomAvailableCell (availableCells) {
        if (Array.isArray(availableCells)) {
            const index = Math.floor(Math.random() * availableCells.length);
            let cell = availableCells.splice(index, 1);
            return cell.length > 0 ? cell[0] : null;
        }

        return null;
    }

    availableCells () {
        let cells = [];
        for (let i = 0; i < this.props.rows; i++) {
            for (let j = 0; j < this.props.cols; j++) {
                if (this.state.board[i][j].tile === null) {
                    cells.push({
                        row: i,
                        col: j
                    });
                }
            }
        }

        return cells;
    }

    checkCellsAvailable () {
        return this.availableCells().length > 0;
    }

    createTile (cell, isNew) {
        const w = cell.width;
        const h = cell.height;
        const x = cell.x;
        const y = cell.y;

        return <Tile 
            width={w} 
            height={h} 
            x={x} 
            y={y} 
            value={this.randomCellValue()} 
            newTile={isNew} 
            merged={false}
        />;
    }

    emptyCell(cell, r, c) {
        const spacing = cell.spacing;
        const w = cell.width;
        const h = cell.height;

        return Object.assign({}, {
            width: w,
            height: h,
            x: spacing * (c + 1) + c * w,
            y: spacing * (r + 1) + r * h,
            tile: null
        });
    }

    emptyBoard(gridSize, r, c) {
        const gridSpacing = calcGridSpacing(gridSize, r >= c ? r : c);
        const cellHeight = calcCellHeight(gridSize, r, gridSpacing);
        const cellWidth = calcCellWidth(gridSize, c, gridSpacing);

        let board = new Array(r).fill(new Array(c).fill({
            spacing: gridSpacing,
            width: cellWidth,
            height: cellHeight
        }));

        return board.map((row, r) => {
            return row.map((cell, c) => {
                return this.emptyCell(cell, r, c);
            });
        });
    }

    render () {
        return (
            <div id="game-board">
                {
                    this.state.board.map((row, r) => {
                        return row.map((cell, c) => {
                            return cell.tile;
                        });
                    })
                }
            </div>
        );
    }
}