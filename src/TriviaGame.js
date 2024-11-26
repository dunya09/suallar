import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TriviaGame = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerFeedback, setAnswerFeedback] = useState(null);
  const [helpUsed, setHelpUsed] = useState({ chatGPT: false, fiftyFifty: false });
  const [timer, setTimer] = useState(15);  // Hər suala 15 saniyə vaxt veriləcək
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Prize Ladder (Mükafat pilləsi)
  const prizeLadder = [
    100, 500, 2500, 12500, 62500, 312500, 1562500, 7812500, 39062500, 195312500
  ];

  // Sualları yükləmək
  useEffect(() => {
    axios.get('https://opentdb.com/api.php?amount=10&type=multiple')
      .then((response) => {
        setQuestions(response.data.results);
      })
      .catch((error) => {
        console.error('Suallar yüklənərkən xəta baş verdi:', error);
      });
  }, []);

  // Sualların cavablarını yoxlamaq
  const handleAnswer = (answer, isCorrect) => {
    if (answered || isTimeUp) return;

    setAnswered(true);
    setSelectedAnswer(answer);
    setAnswerFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setScore(score + prizeLadder[currentQuestionIndex]);
    }

    setTimeout(() => {
      if (isCorrect) {
        if (currentQuestionIndex < 9) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setAnswered(false);
          setSelectedAnswer(null); // Növbəti sual üçün cavabı sıfırlayırıq
          setAnswerFeedback(null);
        } else {
          setIsGameOver(true);
        }
      } else {
        setIsGameOver(true);
      }
    }, 1000);
  };

  // Timer (Vaxt məhdudiyyəti)
  useEffect(() => {
    if (isTimeUp) return;
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsTimeUp(true);
      setAnswered(true);
      setTimeout(() => setIsGameOver(true), 1000);  // Vaxt bitdikdən sonra oyunu bitiririk
    }
  }, [timer, isTimeUp]);

  // ChatGPT kömək funksiyası
  const handleChatGPTHelp = () => {
    if (helpUsed.chatGPT) return;
    setHelpUsed({ ...helpUsed, chatGPT: true });
    const correctAnswer = questions[currentQuestionIndex].correct_answer;
    alert(`ChatGPT: Düzgün cavab: ${correctAnswer}`);
  };

  // Yarıya bölmək funksiyası
  const handleFiftyFifty = () => {
    if (helpUsed.fiftyFifty) return; // Əgər artıq istifadə olunubsa, heç nə etmə
    setHelpUsed({ ...helpUsed, fiftyFifty: true });
  
    const correctAnswer = questions[currentQuestionIndex].correct_answer;
    const incorrectAnswers = questions[currentQuestionIndex].incorrect_answers;
  
    // Təsadüfi bir səhv cavab seçirik
    const randomIncorrect = incorrectAnswers[
      Math.floor(Math.random() * incorrectAnswers.length)
    ];
  
    // Yeni cavablar siyahısı: 1 doğru + 1 təsadüfi səhv
    const newAnswers = [correctAnswer, randomIncorrect].sort(() => Math.random() - 0.5);
  
    // Sualları yeniləyirik
    setQuestions(questions.map((q, index) => 
      index === currentQuestionIndex 
        ? { 
            ...q, 
            incorrect_answers: [randomIncorrect], // Yalnız 1 səhv cavab qalır
            correct_answer: correctAnswer        // Doğru cavabı saxlayırıq
          } 
        : q
    ));
  };
  
  

  // Oyun bitdikdə nə olacağı
  if (isGameOver) {
    return (
      <div className="result-screen">
        <h2 className="result-screen-h2">Oyun Bitdi!</h2>
        <p className="result-screen-p">Topladığınız Məbləğ: ${score}</p>
        <button onClick={() => window.location.reload()}>Yenidən Başla</button>
      </div>
    );
  }

  if (!questions.length) return <p>Yüklənir...</p>;

  const currentQuestion = questions[currentQuestionIndex];
  const answers = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer].sort();

  return (
    <div className="trivia-game">
      <div className="side-bar">
        <div className="prize-ladder">
          <h3>Mükafat Pilləsi:</h3>
          {prizeLadder.map((amount, index) => {
            const prizeClass = (index === currentQuestionIndex) ? (answerFeedback === 'correct' ? 'correct-prize' : 'incorrect-prize') : '';
            return (
              <p key={index} className={`prize ${prizeClass}`}>
                ${amount}
              </p>
            );
          })}
        </div>
        <div className="help-buttons">
          <button onClick={handleChatGPTHelp} disabled={helpUsed.chatGPT}>ChatGPT Kömək</button>
          <button onClick={handleFiftyFifty} disabled={helpUsed.fiftyFifty}>Yarıya Bölmək</button>
        </div>
      </div>

      <div className="game-area">
        <h2 className="question-area">{currentQuestion.question}</h2>
        <div className="timer">Qalan Vaxt: {timer} saniyə</div>

        <div className="answers">
          {answers.map((answer, index) => {
            const isCorrect = answer === currentQuestion.correct_answer;
            const isSelected = selectedAnswer === answer;
            const buttonClass = isSelected
              ? isCorrect
                ? 'correct-answer'
                : 'incorrect-answer'
              : 'normal-answer';

            return (
              <button
                key={index}
                className={`answer-button ${buttonClass}`}
                onClick={() => handleAnswer(answer, isCorrect)}
                disabled={answered || isTimeUp}
              >
                {answer}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TriviaGame;














