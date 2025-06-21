let currentLevel = 75; // 이전: 15 * 5
let currentStage = 1;
let currentBetUnit = 0;
let totalUnits = 75; // 이전: 15 * 5. 시작 유닛은 레벨 15 (이제 레벨 75)부터 15 (이제 75)로 가정합니다.
let winStreak = 0; // 연속 승리 카운터 (0: 첫 베팅, 1: 첫 베팅 승리 후 다음 베팅)
let betHistory = []; // 이전 상태를 저장할 배열 (이전 단계 버튼용)

// 각 레벨 및 단계별 베팅 규칙 정의
const levelMap = {
    // 모든 레벨 키를 5배로 변경 (예: 3 -> 15, 4 -> 20 등)
    15: { // 이전: 3
        1: { bet: 15, win: { type: 'goto', level: 30 }, lose: { type: 'gameOver' } } // bet: 3*5, level: 6*5
    },
    20: { // 이전: 4
        1: { bet: 20, win: { type: 'goto', level: 40 }, lose: { type: 'gameOver' } } // bet: 4*5, level: 8*5
    },
    25: { // 이전: 5
        1: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevel', units: [10, 20] }, lose: { type: 'goto', stage: 2 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5]
        2: { bet: 15, win: { type: 'calcLevelSubUnit', subtract: 10 }, lose: { type: 'gameOver' } } // bet: 3*5, subtract: 2*5
    },
    30: { // 이전: 6
        1: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevel', units: [10, 20] }, lose: { type: 'goto', stage: 2 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5]
        2: { bet: 20, win: { type: 'calcLevelSubUnit', subtract: 10 }, lose: { type: 'gameOver' } } // bet: 4*5, subtract: 2*5
    },
    35: { // 이전: 7
        1: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevel', units: [10, 20] }, lose: { type: 'goto', stage: 2 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5]
        2: { bet: 25, win: { type: 'calcLevelSubUnit', subtract: 10 }, lose: { type: 'gameOver' } } // bet: 5*5, subtract: 2*5
    },
    40: { // 이전: 8
        1: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevel', units: [10, 20] }, lose: { type: 'goto', stage: 2 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5]
        2: { bet: 30, win: { type: 'calcLevelSubUnit', subtract: 10 }, lose: { type: 'gameOver' } } // bet: 6*5, subtract: 2*5
    },
    45: { // 이전: 9
        1: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevel', units: [10, 20] }, lose: { type: 'goto', stage: 2 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5]
        2: { bet: 35, win: { type: 'calcLevelSubUnit', subtract: 10 }, lose: { type: 'gameOver' } } // bet: 7*5, subtract: 2*5
    },
    50: { // 이전: 10
        1: { bet1: 5, bet2: 10, win: { type: 'calcLevelSumCurrentLevel', units: [5, 10] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1*5, bet2: 2*5, units: [1*5, 2*5]
        2: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [10, 20], subtract: 5 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5], subtract: 1*5
        3: { bet: 35, win: { type: 'goto', level: 70 }, lose: { type: 'gameOver' } } // bet: 7*5, level: 14*5
    },
    55: { // 이전: 11
        1: { bet: 10, win: { type: 'calcLevelSumCurrentLevel', units: [10] }, lose: { type: 'goto', stage: 2 } }, // bet: 2*5, units: [2*5]
        2: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [10, 20], subtract: 5 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5], subtract: 1*5
        3: { bet: 35, win: { type: 'goto', level: 70 }, lose: { type: 'gameOver' } } // bet: 7*5, level: 14*5
    },
    60: { // 이전: 12
        1: { bet1: 5, bet2: 10, win: { type: 'calcLevelSumCurrentLevel', units: [5, 10] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1*5, bet2: 2*5, units: [1*5, 2*5]
        2: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [10, 20], subtract: 5 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5], subtract: 1*5
        3: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [10, 20], subtract: 15 }, lose: { type: 'goto', stage: 4 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5], subtract: 3*5
        4: { bet: 35, win: { type: 'goto', level: 70 }, lose: { type: 'gameOver' } } // bet: 7*5, level: 14*5
    },
    65: { // 이전: 13
        1: { bet: 10, win: { type: 'calcLevelSumCurrentLevel', units: [10] }, lose: { type: 'goto', stage: 2 } }, // bet: 2*5, units: [2*5]
        2: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [10, 20], subtract: 5 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5], subtract: 1*5
        3: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [10, 20], subtract: 15 }, lose: { type: 'goto', stage: 4 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5], subtract: 3*5
        4: { bet: 35, win: { type: 'goto', level: 70 }, lose: { type: 'gameOver' } } // bet: 7*5, level: 14*5
    },
    70: { // 이전: 14
        1: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevel', units: [10, 20] }, lose: { type: 'goto', stage: 2 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5]
        2: { bet: 15, win: { type: 'goto', level: 75 }, lose: { type: 'goto', stage: 3 } }, // bet: 3*5, level: 15*5
        3: { bet1: 15, bet2: 30, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15, 30], subtract: 25 }, lose: { type: 'gotoLevel', level: 30 } } // bet1: 3*5, bet2: 6*5, units: [3*5, 6*5], subtract: 5*5, level: 6*5
    },
    75: { // 이전: 15
        1: { bet1: 5, bet2: 10, win: { type: 'calcLevelSumCurrentLevel', units: [5, 10] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1*5, bet2: 2*5, units: [1*5, 2*5]
        2: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [10, 20], subtract: 5 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5], subtract: 1*5
        3: { bet: 15, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15], subtract: 15 }, lose: { type: 'goto', stage: 4 } }, // bet: 3*5, units: [3*5], subtract: 3*5
        4: { bet1: 15, bet2: 30, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15, 30], subtract: 30 }, lose: { type: 'calcLevelSubCurrentLevel', subtract: 45 } } // bet1: 3*5, bet2: 6*5, units: [3*5, 6*5], subtract: 6*5, subtract: 9*5
    },
    80: { // 이전: 16
        1: { bet1: 5, bet2: 10, win: { type: 'calcLevelSumCurrentLevel', units: [5, 10] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1*5, bet2: 2*5, units: [1*5, 2*5]
        2: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [10, 20], subtract: 5 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5], subtract: 1*5
        3: { bet: 15, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15], subtract: 15 }, lose: { type: 'goto', stage: 4 } }, // bet: 3*5, units: [3*5], subtract: 3*5
        4: { bet1: 15, bet2: 30, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15, 30], subtract: 30 }, lose: { type: 'calcLevelSubCurrentLevel', subtract: 45 } } // bet1: 3*5, bet2: 6*5, units: [3*5, 6*5], subtract: 6*5, subtract: 9*5
    },
    85: { // 이전: 17
        1: { bet1: 5, bet2: 10, win: { type: 'calcLevelSumCurrentLevel', units: [5, 10] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1*5, bet2: 2*5, units: [1*5, 2*5]
        2: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [10, 20], subtract: 5 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5], subtract: 1*5
        3: { bet: 15, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15], subtract: 15 }, lose: { type: 'goto', stage: 4 } }, // bet: 3*5, units: [3*5], subtract: 3*5
        4: { bet1: 15, bet2: 30, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15, 30], subtract: 30 }, lose: { type: 'calcLevelSubCurrentLevel', subtract: 45 } } // bet1: 3*5, bet2: 6*5, units: [3*5, 6*5], subtract: 6*5, subtract: 9*5
    },
    90: { // 이전: 18
        1: { bet1: 5, bet2: 10, win: { type: 'calcLevelSumCurrentLevel', units: [5, 10] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1*5, bet2: 2*5, units: [1*5, 2*5]
        2: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [10, 20], subtract: 5 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5], subtract: 1*5
        3: { bet: 15, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15], subtract: 15 }, lose: { type: 'goto', stage: 4 } }, // bet: 3*5, units: [3*5], subtract: 3*5
        4: { bet1: 15, bet2: 30, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15, 30], subtract: 30 }, lose: { type: 'calcLevelSubCurrentLevel', subtract: 45 } } // bet1: 3*5, bet2: 6*5, units: [3*5, 6*5], subtract: 6*5, subtract: 9*5
    },
    95: { // 이전: 19
        1: { bet1: 5, bet2: 10, win: { type: 'calcLevelSumCurrentLevel', units: [5, 10] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1*5, bet2: 2*5, units: [1*5, 2*5]
        2: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [10, 20], subtract: 5 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5], subtract: 1*5
        3: { bet: 15, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15], subtract: 15 }, lose: { type: 'goto', stage: 4 } }, // bet: 3*5, units: [3*5], subtract: 3*5
        4: { bet1: 15, bet2: 30, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15, 30], subtract: 30 }, lose: { type: 'calcLevelSubCurrentLevel', subtract: 45 } } // bet1: 3*5, bet2: 6*5, units: [3*5, 6*5], subtract: 6*5, subtract: 9*5
    },
    100: { // 이전: 20
        1: { bet1: 5, bet2: 10, win: { type: 'calcLevelSumCurrentLevel', units: [5, 10] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1*5, bet2: 2*5, units: [1*5, 2*5]
        2: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [10, 20], subtract: 5 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5], subtract: 1*5
        3: { bet: 15, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15], subtract: 15 }, lose: { type: 'goto', stage: 4 } }, // bet: 3*5, units: [3*5], subtract: 3*5
        4: { bet1: 15, bet2: 30, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15, 30], subtract: 30 }, lose: { type: 'calcLevelSubCurrentLevel', subtract: 45 } } // bet1: 3*5, bet2: 6*5, units: [3*5, 6*5], subtract: 6*5, subtract: 9*5
    },
    105: { // 이전: 21
        1: { bet1: 5, bet2: 10, win: { type: 'calcLevelSumCurrentLevel', units: [5, 10] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1*5, bet2: 2*5, units: [1*5, 2*5]
        2: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [10, 20], subtract: 5 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5], subtract: 1*5
        3: { bet: 15, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15], subtract: 15 }, lose: { type: 'goto', stage: 4 } }, // bet: 3*5, units: [3*5], subtract: 3*5
        4: { bet1: 15, bet2: 30, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15, 30], subtract: 30 }, lose: { type: 'calcLevelSubCurrentLevel', subtract: 45 } } // bet1: 3*5, bet2: 6*5, units: [3*5, 6*5], subtract: 6*5, subtract: 9*5
    },
    110: { // 이전: 22
        1: { bet1: 5, bet2: 10, win: { type: 'calcLevelSumCurrentLevel', units: [5, 10] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1*5, bet2: 2*5, units: [1*5, 2*5]
        2: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [10, 20], subtract: 5 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5], subtract: 1*5
        3: { bet1: 15, bet2: 30, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15, 30], subtract: 15 }, lose: { type: 'goto', stage: 4 } }, // bet1: 3*5, bet2: 6*5, units: [3*5, 6*5], subtract: 3*5
        4: {
            bet1: 45, bet2: 15, // bet1: 9*5, bet2: 3*5
            win: { type: 'calcLevelSumCurrentLevelSubtract', units: [45, 15], subtract: 30 }, // units: [9*5, 3*5], subtract: 6*5
            lose: { type: 'specialLoseLevel22_4' }
        }
    },
    115: { // 이전: 23
        1: { bet1: 5, bet2: 10, win: { type: 'calcLevelSumCurrentLevel', units: [5, 10] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1*5, bet2: 2*5, units: [1*5, 2*5]
        2: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [10, 20], subtract: 5 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5], subtract: 1*5
        3: { bet1: 15, bet2: 30, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15, 30], subtract: 15 }, lose: { type: 'goto', stage: 4 } }, // bet1: 3*5, bet2: 6*5, units: [3*5, 6*5], subtract: 3*5
        4: {
            bet1: 45, bet2: 15, // bet1: 9*5, bet2: 3*5
            win: { type: 'calcLevelSumCurrentLevelSubtract', units: [45, 15], subtract: 30 }, // units: [9*5, 3*5], subtract: 6*5
            lose: { type: 'specialLoseLevel23_4' }
        }
    },
    120: { // 이전: 24
        1: { bet1: 5, bet2: 10, win: { type: 'calcLevelSumCurrentLevel', units: [5, 10] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1*5, bet2: 2*5, units: [1*5, 2*5]
        2: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [10, 20], subtract: 5 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5], subtract: 1*5
        3: { bet1: 15, bet2: 30, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15, 30], subtract: 15 }, lose: { type: 'goto', stage: 4 } }, // bet1: 3*5, bet2: 6*5, units: [3*5, 6*5], subtract: 3*5
        4: {
            bet1: 45, bet2: 15, // bet1: 9*5, bet2: 3*5
            win: { type: 'calcLevelSumCurrentLevelSubtract', units: [45, 15], subtract: 30 }, // units: [9*5, 3*5], subtract: 6*5
            lose: { type: 'specialLoseLevel24_4' }
        }
    },
    125: { // 이전: 25
        1: { bet1: 5, bet2: 10, win: { type: 'calcLevelSumCurrentLevel', units: [5, 10] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1*5, bet2: 2*5, units: [1*5, 2*5]
        2: { bet1: 10, bet2: 20, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [10, 20], subtract: 5 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2*5, bet2: 4*5, units: [2*5, 4*5], subtract: 1*5
        3: { bet1: 15, bet2: 25, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15, 25], subtract: 15 }, lose: { type: 'goto', stage: 4 } }, // bet1: 3*5, bet2: 5*5, units: [3*5, 5*5], subtract: 3*5
        4: {
            bet1: 45, bet2: 10, // bet1: 9*5, bet2: 2*5
            win: { type: 'calcLevelSumCurrentLevelSubtract', units: [45, 10], subtract: 30 }, // units: [9*5, 2*5], subtract: 6*5
            lose: { type: 'specialLoseLevel25_4' }
        }
    },
    130: { // 이전: 26
        1: { bet1: 5, bet2: 10, win: { type: 'calcLevelSumCurrentLevel', units: [5, 10] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1*5, bet2: 2*5, units: [1*5, 2*5]
        2: { bet1: 10, bet2: 15, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [10, 15], subtract: 5 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2*5, bet2: 3*5, units: [2*5, 3*5], subtract: 1*5
        3: { bet1: 15, bet2: 20, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15, 20], subtract: 15 }, lose: { type: 'goto', stage: 4 } }, // bet1: 3*5, bet2: 4*5, units: [3*5, 4*5], subtract: 3*5
        4: {
            bet1: 45, bet2: 5, // bet1: 9*5, bet2: 1*5
            win: { type: 'calcLevelSumCurrentLevelSubtract', units: [45, 5], subtract: 30 }, // units: [9*5, 1*5], subtract: 6*5
            lose: { type: 'specialLoseLevel26_4' }
        }
    },
    135: { // 이전: 27
        1: { bet1: 5, bet2: 10, win: { type: 'calcLevelSumCurrentLevel', units: [5, 10] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1*5, bet2: 2*5, units: [1*5, 2*5]
        2: { bet1: 10, bet2: 10, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [10, 10], subtract: 5 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2*5, bet2: 2*5, units: [2*5, 2*5], subtract: 1*5
        3: { bet1: 15, bet2: 15, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15, 15], subtract: 15 }, lose: { type: 'goto', stage: 4 } }, // bet1: 3*5, bet2: 3*5, units: [3*5, 3*5], subtract: 3*5
        4: { bet: 45, win: { type: 'goto', level: 150 }, lose: { type: 'gotoLevel', level: 60 } } // bet: 9*5, level: 30*5, level: 12*5
    },
    140: { // 이전: 28
        1: { bet1: 5, bet2: 5, win: { type: 'calcLevelSumCurrentLevel', units: [5, 5] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1*5, bet2: 1*5, units: [1*5, 1*5]
        2: { bet1: 10, bet2: 5, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [10, 5], subtract: 5 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2*5, bet2: 1*5, units: [2*5, 1*5], subtract: 1*5
        3: { bet1: 15, bet2: 10, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15, 10], subtract: 15 }, lose: { type: 'goto', stage: 4 } }, // bet1: 3*5, bet2: 2*5, units: [3*5, 2*5], subtract: 3*5
        4: { bet: 40, win: { type: 'goto', level: 150 }, lose: { type: 'gotoLevel', level: 70 } } // bet: 8*5, level: 30*5, level: 14*5
    },
    145: { // 이전: 29
        1: { bet: 5, win: { type: 'goto', level: 150 }, lose: { type: 'goto', stage: 2 } }, // bet: 1*5, level: 30*5
        2: { bet: 10, win: { type: 'goto', level: 150 }, lose: { type: 'goto', stage: 3 } }, // bet: 2*5, level: 30*5
        3: { bet1: 15, bet2: 5, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [15, 5], subtract: 15 }, lose: { type: 'goto', stage: 4 } }, // bet1: 3*5, bet2: 1*5, units: [3*5, 1*5], subtract: 3*5
        4: { bet: 35, win: { type: 'goto', level: 150 }, lose: { type: 'gotoLevel', level: 80 } } // bet: 7*5, level: 30*5, level: 16*5
    },
    150: { // 이전: 30
        // 레벨 30 (이제 150)은 승리 목표 레벨로, 특별한 베팅 규칙이 없을 수 있습니다.
        // 또는 최종 단계의 베팅 규칙을 정의할 수 있습니다.
        1: { bet: 50, win: { type: 'gameWin' }, lose: { type: 'gameOver' } } // bet: 10*5. 예시: 레벨 150의 최종 베팅
    }
};

// DOM 요소 가져오기 (이 부분은 변경 없음)
const currentLevelEl = document.getElementById('currentLevel');
const currentStageEl = document.getElementById('currentStage');
const currentBetUnitEl = document.getElementById('currentBetUnit');
const totalUnitsEl = document.getElementById('totalUnits');
const messageEl = document.getElementById('message');
const winButton = document.getElementById('winButton');
const loseButton = document.getElementById('loseButton');
const resetButton = document.getElementById('resetButton');
const undoButton = document.getElementById('undoButton');

// 게임 초기화 함수
function initializeGame() {
    currentLevel = 75; // 이전: 15 * 5. 시작 레벨 15 (이제 75)로 변경
    currentStage = 1;
    totalUnits = 75; // 이전: 15 * 5. 시작 유닛 15 (이제 75)로 변경
    winStreak = 0; // 연속 승리 카운터 리셋
    betHistory = []; // 기록 초기화
    updateDisplay(); // 화면 업데이트
    messageEl.textContent = `게임 시작! 레벨 ${currentLevel}, ${currentStage}단계.`;
    messageEl.classList.remove('win', 'lose'); // 메시지 클래스 초기화
    enableButtons(); // 버튼 활성화
}

// 디스플레이 업데이트 함수 (이 부분은 currentBetUnit 계산 로직이 변경되었으므로 확인 필요)
function updateDisplay() {
    const levelData = levelMap[currentLevel];
    if (levelData && levelData[currentStage]) {
        const stageData = levelData[currentStage];
        // winStreak 값에 따라 bet1 또는 bet2를 사용
        if (stageData.bet) { // 단일 베팅이 정의된 경우
            currentBetUnit = stageData.bet;
        } else if (stageData.bet1 && stageData.bet2) { // 2단계 베팅이 정의된 경우
            currentBetUnit = winStreak === 0 ? stageData.bet1 : stageData.bet2;
        } else {
            currentBetUnit = 0; // 정의되지 않은 경우
        }
    } else {
        currentBetUnit = 0; // 정의되지 않은 레벨/단계 (새로운 레벨이 추가되어야 할 때 발생 가능)
    }

    currentLevelEl.textContent = currentLevel;
    currentStageEl.textContent = currentStage;
    currentBetUnitEl.textContent = currentBetUnit;
    totalUnitsEl.textContent = totalUnits;

    // 게임 승리 조건 확인
    if (totalUnits >= 150) { // 이전: 30 * 5
        gameWin("축하합니다! 총 유닛이 150에 도달하여 게임에 승리했습니다!");
        return; // 승리 시 추가 로직 실행 방지
    }
    // 게임 패배 조건 확인 (초기화 시점 제외)
    // totalUnits가 0 이하가 되면 게임 오버. 단, 초기 totalUnits가 15 (이제 75)일 때는 예외.
    if (totalUnits <= 0 && !(currentLevel === 75 && currentStage === 1 && totalUnits === 75)) { // 이전: 15 * 5
        gameOver("총 유닛이 0이거나 0 미만이 되어 게임에 패배했습니다.");
        return; // 패배 시 추가 로직 실행 방지
    }

    // 이전 단계 버튼 활성화/비활성화 상태 업데이트
    undoButton.disabled = betHistory.length === 0;
}

// 게임 승리 처리 함수 (변경 없음)
function gameWin(msg) {
    messageEl.textContent = msg;
    messageEl.classList.remove('lose');
    messageEl.classList.add('win'); // 승리 메시지 스타일 적용
    disableButtons();
    currentLevelEl.textContent = "승리";
    currentStageEl.textContent = "승리";
    currentBetUnitEl.textContent = "0";
}

// 게임 패배 처리 함수 (변경 없음)
function gameOver(msg) {
    messageEl.textContent = msg;
    messageEl.classList.remove('win');
    messageEl.classList.add('lose'); // 패배 메시지 스타일 적용
    disableButtons();
    currentLevelEl.textContent = "패배";
    currentStageEl.textContent = "패배";
    currentBetUnitEl.textContent = "0";
}

// 버튼 비활성화 함수 (변경 없음)
function disableButtons() {
    winButton.disabled = true;
    loseButton.disabled = true;
    undoButton.disabled = true;
}

// 버튼 활성화 함수 (변경 없음)
function enableButtons() {
    winButton.disabled = false;
    loseButton.disabled = false;
    // 이전 단계 버튼은 기록이 있을 때만 활성화
    undoButton.disabled = betHistory.length === 0;
}

// 현재 게임 상태 저장 (이전 단계 버튼용) (변경 없음)
function saveState() {
    betHistory.push({
        level: currentLevel,
        stage: currentStage,
        totalUnits: totalUnits,
        winStreak: winStreak
    });
}

// 승리 버튼 클릭 핸들러 (내부 숫자만 5배)
function handleWin() {
    saveState(); // 현재 상태 저장

    const levelData = levelMap[currentLevel];
    if (!levelData || !levelData[currentStage]) {
        messageEl.textContent = "오류: 현재 레벨/단계 데이터가 정의되지 않았습니다.";
        gameOver("시스템 오류로 게임 종료.");
        return;
    }

    const stageData = levelData[currentStage];
    let unitsWon = currentBetUnit; // 기본적으로 현재 베팅 유닛만큼 획득

    // 총 유닛 증가
    totalUnits += unitsWon;

    // 승리 로직 처리
    if (stageData.win.type === 'goto') {
        currentLevel = stageData.win.level;
        currentStage = 1;
        winStreak = 0; // 레벨 이동 시 연속 승리 리셋
        messageEl.textContent = `승리! 레벨 ${currentLevel}로 이동합니다.`;
    } else if (stageData.win.type === 'calcLevelSumCurrentLevel') {
        winStreak++;
        if (winStreak === 2) { // 2연승
            const sumOfBetUnits = stageData.win.units.reduce((sum, u) => sum + u, 0);
            currentLevel += sumOfBetUnits;
            currentStage = 1;
            winStreak = 0; // 2연승 달성 후 연속 승리 리셋
            messageEl.textContent = `2연승! 레벨 ${currentLevel}로 이동합니다.`;
        } else { // 1연승
            // 이곳의 숫자는 levelMap에서 가져오므로 직접 변경 불필요
            messageEl.textContent = `승리! 2번째 베팅(${stageData.bet2}유닛)을 시도합니다.`;
        }
    } else if (stageData.win.type === 'calcLevelSumCurrentLevelSubtract') {
        winStreak++;
        if (winStreak === 2 || !stageData.bet1 || !stageData.bet2) { // 2연승이거나 단일 베팅인데 해당 타입인 경우
            const sumOfBetUnits = stageData.win.units.reduce((sum, u) => sum + u, 0);
            currentLevel += sumOfBetUnits - stageData.win.subtract;
            currentStage = 1;
            winStreak = 0;
            messageEl.textContent = `승리! 레벨 ${currentLevel}로 이동합니다.`;
        } else { // 1연승
            // 이곳의 숫자는 levelMap에서 가져오므로 직접 변경 불필요
            messageEl.textContent = `승리! 2번째 베팅(${stageData.bet2}유닛)을 시도합니다.`;
        }
    } else if (stageData.win.type === 'gameWin') {
        gameWin("최종 목표 달성! 게임에 승리했습니다!");
        return;
    } else {
        messageEl.textContent = "오류: 알 수 없는 승리 규칙입니다.";
        gameOver("시스템 오류로 게임 종료.");
        return;
    }

    updateDisplay();
}

// 패배 버튼 클릭 핸들러 (내부 숫자만 5배)
function handleLose() {
    saveState(); // 현재 상태 저장

    const levelData = levelMap[currentLevel];
    if (!levelData || !levelData[currentStage]) {
        messageEl.textContent = "오류: 현재 레벨/단계 데이터가 정의되지 않았습니다.";
        gameOver("시스템 오류로 게임 종료.");
        return;
    }

    const stageData = levelData[currentStage];
    let unitsLost = currentBetUnit; // 현재 베팅 유닛만큼 손실

    // 총 유닛 감소
    totalUnits -= unitsLost;

    // 연속 승리 카운터 리셋
    winStreak = 0;

    // 패배 로직 처리
    if (stageData.lose.type === 'gameOver') {
        gameOver("베팅 패배로 유닛이 소진되었습니다.");
    } else if (stageData.lose.type === 'goto') {
        currentStage = stageData.lose.stage;
        messageEl.textContent = `패배! ${currentStage}단계로 이동합니다.`;
    } else if (stageData.lose.type === 'gotoLevel') {
        currentLevel = stageData.lose.level;
        currentStage = 1; // 레벨 이동 시 1단계로 리셋
        messageEl.textContent = `패배! 레벨 ${currentLevel}로 이동합니다.`;
    } else if (stageData.lose.type === 'calcLevelSubCurrentLevel') {
        currentLevel -= stageData.lose.subtract; // 이곳의 숫자는 levelMap에서 가져오므로 직접 변경 불필요
        currentStage = 1; // 레벨 이동 시 1단계로 리셋
        messageEl.textContent = `패배! 레벨 ${currentLevel}로 이동합니다.`;
    }
    // 레벨 22-26 (이제 110-130)의 4단계 특수 패배 로직
    else if (stageData.lose.type && stageData.lose.type.startsWith('specialLoseLevel')) {
        let nextLevel = currentLevel;
        // 패배한 베팅 유닛이 첫 번째 베팅 유닛(bet1)과 같으면 1번째 패배로 간주
        // 아니면 (대부분 2번째 베팅 유닛 bet2에서 패배한 경우) 2번째 패배로 간주
        if (unitsLost === stageData.bet1) {
            nextLevel = currentLevel - 75; // 이전: 15 * 5
            messageEl.textContent = `패배! (1번째 베팅 실패) 레벨 ${nextLevel}로 이동합니다.`;
        } else if (unitsLost === stageData.bet2) {
            if (stageData.lose.type === 'specialLoseLevel25_4') { // 이전: 25 * 5 = 125 레벨
                nextLevel = currentLevel + 5; // 이전: 1 * 5
                messageEl.textContent = `패배! (2번째 베팅 실패) 레벨 ${nextLevel}로 이동합니다.`;
            } else if (stageData.lose.type === 'specialLoseLevel26_4') { // 이전: 26 * 5 = 130 레벨
                nextLevel = currentLevel + 10; // 이전: 2 * 5
                messageEl.textContent = `패배! (2번째 베팅 실패) 레벨 ${nextLevel}로 이동합니다.`;
            } else { // 22, 23, 24 (이제 110, 115, 120)의 4단계 2번째 베팅 패배 시
                nextLevel = currentLevel; // 현재 레벨 유지
                messageEl.textContent = `패배! (2번째 베팅 실패) 현재 레벨 ${nextLevel}을 유지합니다.`;
            }
        } else {
            messageEl.textContent = "오류: 알 수 없는 4단계 패배 규칙입니다.";
            gameOver("시스템 오류로 게임 종료.");
            return;
        }
        currentLevel = nextLevel;
        currentStage = 1; // 특수 패배 후 다음 레벨의 1단계로 이동
    }
    else {
        messageEl.textContent = "알 수 없는 패배 규칙입니다.";
        gameOver("시스템 오류로 게임 종료.");
        return;
    }

    updateDisplay();
}

// 리셋 버튼 클릭 핸들러 (변경 없음)
function handleReset() {
    if (confirm("정말로 게임을 리셋하시겠습니까?")) {
        initializeGame();
    }
}

// 이전 단계 버튼 클릭 핸들러 (변경 없음)
function handleUndo() {
    if (betHistory.length > 0) {
        const prevState = betHistory.pop(); // 가장 최근 상태 가져오기
        currentLevel = prevState.level;
        currentStage = prevState.stage;
        totalUnits = prevState.totalUnits;
        winStreak = prevState.winStreak;
        messageEl.textContent = "이전 상태로 돌아갑니다.";
        messageEl.classList.remove('win', 'lose'); // 메시지 클래스 초기화
        updateDisplay();
        enableButtons(); // 이전 단계 후 버튼 활성화
    } else {
        messageEl.textContent = "더 이상 돌아갈 이전 상태가 없습니다.";
        undoButton.disabled = true; // 기록이 없으면 비활성화
    }
}

// 이벤트 리스너 연결 (변경 없음)
winButton.addEventListener('click', handleWin);
loseButton.addEventListener('click', handleLose);
resetButton.addEventListener('click', handleReset);
undoButton.addEventListener('click', handleUndo);

// 페이지 로드 시 초기화 (변경 없음)
document.addEventListener('DOMContentLoaded', initializeGame);