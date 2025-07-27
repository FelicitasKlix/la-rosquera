import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');
const roscoRadius = width * 0.35;
const centerX = width / 2;
const centerY = roscoRadius + 20;

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => l !== 'Ñ');

const getColorByStatus = (status) => {
  switch (status) {
    case 'correct':
      return '#4CAF50';
    case 'pass':
      return '#FFEB3B';
    case 'incorrect':
      return '#F44336';
    default:
      return '#E0E0E0';
  }
};

export default function RoscoScreen() {
  const [letterStatus, setLetterStatus] = useState(
    letters.reduce((acc, letter) => {
      acc[letter] = 'pending';
      return acc;
    }, {})
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(150);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!gameStarted || gameOver) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setGameOver(true);
          alert('¡Se terminó el tiempo! Fin del juego.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [gameStarted, gameOver]);

  const advanceToNextLetter = (startIndex) => {
    let index = startIndex;
    const total = letters.length;
    let found = false;

    for (let i = 0; i < total * 2; i++) {
      const letter = letters[index];
      const status = letterStatus[letter];
      if (status === 'pending' || status === 'pass') {
        found = true;
        break;
      }
      index = (index + 1) % total;
    }

    return found ? index : -1;
  };

  const onPressAnswer = (answer) => {
    if (!gameStarted || gameOver) return;

    const currentLetter = letters[currentIndex];

    setLetterStatus(prev => {
      const newStatus = {
        ...prev,
        [currentLetter]: answer,
      };

      const hasPendingOrPass = letters.some(l => newStatus[l] === 'pending' || newStatus[l] === 'pass');

      if (!hasPendingOrPass) {
        setGameOver(true);
        alert('¡Terminaste el rosco!');
      }

      return newStatus;
    });

    const nextIndex = advanceToNextLetter((currentIndex + 1) % letters.length);
    if (nextIndex !== -1) {
      setCurrentIndex(nextIndex);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startGame = () => {
    setLetterStatus(
      letters.reduce((acc, letter) => {
        acc[letter] = 'pending';
        return acc;
      }, {})
    );
    setCurrentIndex(0);
    setTimeLeft(150);
    setGameOver(false);
    setGameStarted(true);
  };

  return (
    <View style={styles.container}>
      {/* Timer arriba del rosco */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
      </View>

      {/* Rosco */}
      <Svg height={roscoRadius * 2 + 40} width={width}>
        <Circle
          cx={centerX}
          cy={centerY}
          r={roscoRadius}
          stroke="#ccc"
          strokeWidth={1}
          fill="none"
        />

        {letters.map((letter, i) => {
          const angle = i * (2 * Math.PI) / letters.length - Math.PI / 2;
          const x = centerX + roscoRadius * Math.cos(angle);
          const y = centerY + roscoRadius * Math.sin(angle);

          const isActive = i === currentIndex;

          return (
            <React.Fragment key={letter}>
              <Circle
                cx={x}
                cy={y}
                r={isActive ? 20 : 16}
                fill={getColorByStatus(letterStatus[letter])}
                stroke={isActive ? '#000' : 'none'}
                strokeWidth={isActive ? 2 : 0}
              />
              <SvgText
                x={x}
                y={y}
                fill="black"
                fontSize={isActive ? "18" : "14"}
                fontWeight="bold"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {letter}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Pregunta */}
      <View style={styles.questionBox}>
        <Text style={styles.questionText}>
          {gameStarted
            ? `Pregunta para la letra "${letters[currentIndex]}"`
            : 'Presioná "Comenzar Juego" para empezar'}
        </Text>
      </View>

      {/* Botones de respuesta */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          disabled={!gameStarted || gameOver}
          style={[
            styles.button,
            { backgroundColor: (!gameStarted || gameOver) ? '#9ad79cff' : '#4CAF50' }
          ]}
          onPress={() => onPressAnswer('correct')}
        >
          <Text style={styles.buttonText}>Correcto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={!gameStarted || gameOver}
          style={[
            styles.button,
            { backgroundColor: (!gameStarted || gameOver) ? '#dede6b' : '#FFEB3B' }
          ]}
          onPress={() => onPressAnswer('pass')}
        >
          <Text style={[styles.buttonText, { color: (!gameStarted || gameOver) ? '#999' : '#333' }]}>
            Pasapalabra
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={!gameStarted || gameOver}
          style={[
            styles.button,
            { backgroundColor: (!gameStarted || gameOver) ? '#e58a8a' : '#F44336' }
          ]}
          onPress={() => onPressAnswer('incorrect')}
        >
          <Text style={styles.buttonText}>Incorrecto</Text>
        </TouchableOpacity>
      </View>

      {/* Botón Comenzar Juego */}
        {!gameStarted && (
        <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
            <TouchableOpacity
            style={[styles.button, { backgroundColor: '#2196F3', width: '100%' }]}
            onPress={startGame}
            >
            <Text style={styles.buttonText}>Comenzar Juego</Text>
            </TouchableOpacity>
        </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  timerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F44336',
  },
  questionBox: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    minHeight: 80,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
