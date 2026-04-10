'use client';

import React, { useState } from 'react';
import './quiz-styles.css';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "When working with AI, how confident are you in getting the results you want?",
    options: [
      { value: 'A', label: 'You are unsure and have to experiment a lot' },
      { value: 'B', label: 'You get what you need with some trial and adjustment' },
      { value: 'C', label: 'You are confident guiding AI to produce exactly what you want' }
    ]
  },
  {
    id: 2,
    question: "Think about how you move information around. Which of these sounds most like your screen?",
    options: [
      { value: 'A', label: 'Lots of manual typing. I do the thinking, AI is just on the side.' },
      { value: 'B', label: 'The "Copy-Paste" Shuffle. I generate text in AI, copy it, and paste it into my docs or emails.' },
      { value: 'C', label: "I'm starting to connect things. I use tools where AI just appears in my docs or workflows automatically." }
    ]
  },
  {
    id: 3,
    question: "How do you approach the release of new AI technologies?",
    options: [
      { value: 'A', label: 'I feel the pace of change is overwhelming and prefer to stick with my current tools.' },
      { value: 'B', label: 'I wait for market proof or peer recommendations before integrating new tech.' },
      { value: 'C', label: 'I proactively test new architectures to find a competitive edge and save time.' }
    ]
  },
  {
    id: 4,
    question: "Which area of your workflow would benefit most from high-level automation?",
    options: [
      { value: 'A', label: 'Automating high-volume, low-value tasks like scheduling and inbox management.' },
      { value: 'B', label: 'Using AI to bridge the gap in brainstorming, drafting, and complex content design.' },
      { value: 'C', label: 'Building autonomous pipelines that execute entire projects while I focus on growth.' }
    ]
  },
  {
    id: 5,
    question: "What is your primary goal with AI-automation?",
    options: [
      { value: 'A', label: 'Reducing the hours spent on repetitive manual tasks.' },
      { value: 'B', label: "Leveraging new tools to handle tasks I couldn't do before." },
      { value: 'C', label: 'Building systems that execute projects and solve problems autonomously.' }
    ]
  },
  {
    id: 6,
    question: "If you run the same task through your AI 10 times, how often is the result perfect?",
    options: [
      { value: 'A', label: "It's a gamble. Every result is different and requires manual fixing." },
      { value: 'B', label: 'Mostly consistent, but I still have to double-check everything.' },
      { value: 'C', label: '100% reliable. My system has the guardrails to deliver the same high-quality output every time.' }
    ]
  },
  {
    id: 7,
    question: "Once the AI generates a result, what is the very next thing you do?",
    options: [
      { value: 'A', label: 'I spend significant time reformatting the output and manually migrating it to its destination.' },
      { value: 'B', label: 'I perform a final review and then manually execute the distribution or upload.' },
      { value: 'C', label: 'The output is delivered autonomously; I only perform occasional audits of the logs.' }
    ]
  },
  {
    id: 8,
    question: 'Where is the biggest "wait time" in your current process?',
    options: [
      { value: 'A', label: 'Input. It takes me too long to gather info and tell the AI what to do.' },
      { value: 'B', label: 'Refinement. The AI gives me 80%, but the last 20% takes all my energy.' },
      { value: 'C', label: 'Nowhere. The data flows from point A to point B with zero friction.' }
    ]
  }
];

interface QuizResult {
  success: boolean;
  score: number;
  category: string;
  categoryDescription: string;
  message: string;
}

export default function AIReadinessQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
    setError('');
  };

  const handleAnswer = (questionId: number, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
    setError('');
  };

  const handleNext = () => {
  const currentQuestion = QUIZ_QUESTIONS[currentStep - 1];
  if (!answers[currentQuestion.id]) {
    setError('Please select an answer to continue'); 
    return;
  }
  setCurrentStep(currentStep + 1);
  setError(''); 
};

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
     setError('');
  };

const handleSubmit = async () => {
  if (!userInfo.name || !userInfo.email) {
    setError('Please enter your name and email to see results'); 
    return;
  }
  if (!isValidEmail(userInfo.email)) {
    setError('Please enter a valid email address'); 
    return;
  }

  setIsSubmitting(true);
  setError(''); 

  try {
    const answersArray = QUIZ_QUESTIONS.map(q => answers[q.id]);

    const response = await fetch('/api/ai-quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userInfo.name,
        email: userInfo.email,
        answers: answersArray
      })
    });

    const data: QuizResult = await response.json();

    if (data.success) {
      setResult(data);
      setQuizComplete(true);
    } else {
      setError(data.message || 'Something went wrong. Please try again.'); 
    }
  } catch (error) {
    console.error('Quiz submission error:', error);
    setError('Failed to submit quiz. Please check your connection and try again.'); 
  } finally {
    setIsSubmitting(false);
  }
};

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const progressPercentage = (currentStep / (QUIZ_QUESTIONS.length + 2)) * 100;

  if (quizComplete && result) {
    return (
      <div className="quiz-container">
        <div className="quiz-completion">
          <div className="luna-avatar">
            <img
              src="/assets/luna.png"
              alt="Luna"
              style={{ maxWidth: '120px' }}
            />
          </div>

          <h1 className="completion-title">Great job, {userInfo.name}!</h1>

          <div className="result-card">
            <div className="result-score">Your Score: {result.score}/24</div>
            <h2 className="result-category">{result.category}</h2>
          </div>

          <p className="completion-message">
            Luna is preparing your personalized AI Readiness Report right now.{' '}
            <strong>Check your inbox in the next 60 seconds</strong> for your
            detailed results and your{' '}
            <span className="highlight">AI Marketing Toolkit</span>!
          </p>

          <div className="completion-actions">
            <a href="https://surim.io" className="btn btn-primary">
              Return to Surim
            </a>
            <a href="/ai-marketing-toolkit" className="btn btn-secondary">
              Download Toolkit
            </a>
          </div>

          <p className="email-check">
            📧 Email not showing up? Check your spam folder or{' '}
            <a
              href="#footer"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }}
            >
              scroll down for our contact info
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="quiz-container">
        <div className="quiz-loading">
          <div className="loading-animation">
            <div className="loading-spinner"></div>
          </div>
          <h2 className="loading-title">Luna is analyzing your workflow...</h2>
          <p className="loading-subtitle">Syncing with the Surim database</p>
        </div>
      </div>
    );
  }

  if (currentStep === 0) {
    return (
      <div className="quiz-container quiz-container--intro">

        <img
          src="/assets/banner-quiz.png"
          alt="AI Readiness Quiz"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: 0,
          }}
        />

        <div className="quiz-intro">
          {/* <div className="quiz-header">
            <h1 className="quiz-title">AI Automation Readiness Quiz</h1>
            <p className="quiz-subtitle">
              Meet Luna 👋 Your AI assistant is here to assess your automation maturity
            </p>
          </div> */}

          <div className="intro-content">
            <div className="luna-message">
              <img
                src="/assets/luna.png"
                alt="Luna"
                style={{ width: '56px', borderRadius: '12px', flexShrink: 0 }}
              />
             <div className="message-bubble">
              <p>
                Hey there! I&apos;m Luna, your Surim assistant. I&apos;ve built
                this quick &apos;vibe check&apos; to see if you&apos;re still doing
                the grunt work or if you&apos;re ready to let systems do the heavy
                lifting.
              </p>
              <p>
                <strong>Complete the quiz and get our exclusive AI Marketing Toolkit for free!</strong>{' '}
                It&apos;s packed with templates, guides, and strategies to help you 
                level up your automation game.
              </p>
              <p className="message-time">Takes about 2 minutes ⏱️</p>
            </div>
            </div>

            <button
              onClick={() => setCurrentStep(1)}
              className="btn btn-primary btn-large"
            >
              Start Quiz & Get Your Free Toolkit →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === QUIZ_QUESTIONS.length + 1) {
    return (
      <div className="quiz-container">
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${progressPercentage}%` }} />
        </div>

        <div className="quiz-content">
          <div className="question-number">Almost there!</div>
          <h2 className="question-text">Enter your details to see your results</h2>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="user-info-form">
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={userInfo.name}
                onChange={handleUserInfoChange}
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={userInfo.email}
                onChange={handleUserInfoChange}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className="quiz-navigation">
            <button onClick={handleBack} className="btn btn-secondary">
              ← Back
            </button>
            <div className="nav-spacer" />
            <button onClick={handleSubmit} className="btn btn-primary">
              See My Results →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = QUIZ_QUESTIONS[currentStep - 1];
  const isLastQuestion = currentStep === QUIZ_QUESTIONS.length;

  return (
    <div className="quiz-container">
      <div className="quiz-progress-bar">
        <div className="quiz-progress-fill" style={{ width: `${progressPercentage}%` }} />
      </div>

      <div className="quiz-content">
        <div className="question-number">
          Question {currentStep} of {QUIZ_QUESTIONS.length}
        </div>

      <h2 className="question-text">{currentQuestion.question}</h2>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="options-container">
          {currentQuestion.options.map((option) => (
            <label
              key={option.value}
              className={`option-card ${
                answers[currentQuestion.id] === option.value ? 'selected' : ''
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={option.value}
                checked={answers[currentQuestion.id] === option.value}
                onChange={() => handleAnswer(currentQuestion.id, option.value)}
              />
              <div className="option-content">
                <span className="option-letter">{option.value}</span>
                <span className="option-label">{option.label}</span>
              </div>
            </label>
          ))}
        </div>

        <div className="quiz-navigation">
          {currentStep > 1 && (
            <button onClick={handleBack} className="btn btn-secondary">
              ← Back
            </button>
          )}
          <div className="nav-spacer" />
          <button onClick={handleNext} className="btn btn-primary">
            {isLastQuestion ? 'Continue →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}