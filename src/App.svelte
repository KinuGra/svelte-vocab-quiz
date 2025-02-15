<script>
  import { onMount, tick } from 'svelte';
  import AnswerButton from "./AnswerButton.svelte";
  import "./app.css";
  import { getQuizdataAsync } from "./quizdataFactory";
  import TitlePage from "./TitlePage.svelte";
  import Progressbar from './Progressbar.svelte';
  import GameoverModal from './GameoverModal.svelte';
  import FancyScore from './FancyScore.svelte';  // 正しくインポート
  import { insertScoreAsync } from './supabase.js';

  const [InitialState, TitleState, QuestionState, AnswerState, GameoverState, QuizStart] = [0, 1, 2, 3, 4, 5];
  let state = InitialState; // 状態
  let quizdata;

  //TODO 制限時間の調整
  const maxTime = 10; // 制限時間（秒）
  let time = maxTime; // 残り時間
  let gameoverModal;
  let fancyScore;
  const [VeryEasy, Easy, Normal, Hard, VeryHard] = [0, 1, 2, 3, 4];
  let quizDifficulty;
  let haikei;
  let score = { currentScore: 0 };  // 初期値を設定
  let name = "";
  export let currentScore = 0;
  let renzokuSeikai = 0;

  /** 起動時に一度呼び出す */
  onMount(() => {
    changeToTitle();
    if (fancyScore) {
      score = fancyScore.getScore(); 
    }
  });
  function updateScore(isCorrect) {
  if (fancyScore) {
    fancyScore.updateScore(isCorrect);
    score = fancyScore.getScore();
  }
}

  // テキストを読み上げる関数
  function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  }

  // 状態遷移のための関数群
  function changeToTitle() {
    localStorage.setItem("quizHistory", JSON.stringify([]));
    gameoverModal.closeModal();
    state = TitleState;
  }

  async function changeToQuestionAsync() {
    if (score.currentScore <= 15) {
      quizDifficulty = VeryEasy;
      haikei = '/src/assets/_school_in_spring_1.jpg';
    } else if (score.currentScore <= 30) {
      quizDifficulty = Easy;
      haikei = '/src/assets/_school_in_spring_2.jpg';
    } else if (score.currentScore <= 65) {
      quizDifficulty = Normal;
      haikei = '/src/assets/library_3.jpg';
    } else if (score.currentScore <= 100) {
      quizDifficulty = Hard;
      haikei = '/src/assets/Torii-gate-and-the-first-sunrise-of-the-New-Year1.jpg';
    } else {
      quizDifficulty = VeryHard;
      haikei = '/src/assets/Candles-and-candlesticks3.jpg';
    }

    quizdata = await getQuizdataAsync(quizDifficulty); // 問題画面に遷移するたびにクイズデータを取得
    state = QuestionState;

     // 問題文を読み上げる
    speakText(quizdata.mondai);
  }
  function changeToAnswer(){ // 解答を表示する状態
    /* Answer状態のときにGameover状態に遷移するとsetTimeoutによってQuestion状態に遷移してしまうことに注意 */
    state = AnswerState;
    saveQuizHistory(score, quizdata);
    setTimeout(() => {
      if (state === AnswerState) {
        changeToQuestionAsync();
      }
    }, 1000);
  }

  // 履歴をローカルストレージに保存する関数
  function saveQuizHistory(score, quizData) {
    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    history.push({
      score: currentScore,
      question: quizData.mondai,
      options: quizData.taku,
      correctAnswer: quizData.seikai
    });

    localStorage.setItem("quizHistory", JSON.stringify(history));
  }

  function changeToGameover() {
    score = fancyScore.getScore()
    console.log(score)
    state = GameoverState;
  }

  function changeToQuizstart() {
    state = QuizStart;
    time = maxTime;
    quizDifficulty = VeryEasy;
    console.log(score)
    score.currentScore = 0;

    const timer = setInterval(() => {
      if (state === QuestionState && time < 0) {
        clearInterval(timer);
        changeToGameover();
      }
      if (state === QuestionState) {
        time -= 0.01;
      }
    }, 10);
    changeToQuestionAsync();
  }

  let answerImage = "";
  function answerButtonClicked(isCorrect) {
    if (state !== QuestionState) return;
    if (isCorrect) {
      answerImage = "src/assets/maru.png";
    }

    fancyScore?.updateScore(isCorrect);
    score.currentScore = fancyScore?.getScore().currentScore || 0;
    if (fancyScore.getRenzokuSeikai() >= 5) {
      time = Math.min(time + 1, maxTime);
    } else if (!isCorrect) {
      answerImage = "src/assets/batu.png";
      time -= 1;
    }
    changeToAnswer();
  }

  function okButtonClicked() {
    localStorage.setItem("name", name);
    insertScoreAsync(name, score.currentScore);
    changeToTitle();
  }

  function getScoreMessage(score) {
    if (score <= 20) return { message: "Good" };
    if (score <= 40) return { message: "Great" };
    if (score <= 70) return { message: "Nice" };
    if (score <= 100) return { message: "Excellent" };
    return { message: "perfect" };
  }
</script>

<svelte:head>
  <title>QuizApp</title>
</svelte:head>

<main style="background-image: url({haikei})" class="bg-cover flex flex-col h-svh">
  <!-- FancyScore コンポーネントをここに追加 -->
  <FancyScore bind:this={fancyScore} />

  {#if state === TitleState}
    <div class="bg-[url('/src/assets/_school_in_spring_1.jpg')] bg-cover">
      <TitlePage on:click={changeToQuizstart}></TitlePage>
    </div>
  {:else if state === GameoverState}
    <div class="bg-[url('/src/assets/kouen.jpg')] bg-cover h-full w-full flex flex-col items-center p-4">
      <h2 class="text-3xl font-bold text-red-600 mb-4">タイムアップ！</h2>
      <div class="w-full max-w-lg bg-white/80 p-4 rounded-lg shadow-md flex flex-col items-center mb-8 space-y-4">
        <div class="text-4xl font-bold {getScoreMessage(score.currentScore).color}">
          {getScoreMessage(score.currentScore).message}
        </div>
        <div class="text-xl font-bold">
          スコア: {score.currentScore}
        </div>

        <!-- 正答率と最高連続正解数の表示 -->
        <div class="text-lg">
          正答率: {score.count > 0 ? Math.round((score.Allcorrectcount / score.count) * 100) : 0}%
        </div>
        <div class="text-lg">
          最高連続正解数: {score.BestrenzokuSeikai}
        </div>

        <input bind:value={name} type="input" placeholder="名前の入力" class="p-3 border-none focus:outline-none rounded-xl w-full"/>
        <button on:click={okButtonClicked} class="text-xl w-1/2 border-2 border-gray-500 rounded-xl">OK</button>
      </div>

      <div class="w-full max-w-lg bg-white/80 p-4 rounded-lg shadow-md">
        <h3 class="text-center text-2xl font-bold mb-2">クイズ履歴</h3>
        <ul class="text-center space-y-2">
          {#each JSON.parse(localStorage.getItem("quizHistory")) || [] as item}
            <li class="border p-2 bg-white rounded-md shadow">
              <p class="font-semibold">問題: {item.question}</p>
              <p>選択肢: {item.options.join(", ")}</p>
              <p class="text-green-600">正解: {item.correctAnswer}</p>
            </li>
          {/each}
        </ul>
      </div>
    </div>

  {:else if state === QuestionState || state === AnswerState}
    <FancyScore bind:this={fancyScore} />
    <Progressbar maxTime={maxTime} time={time} />
    <div class="bg-white/60 font-extrabold text-center text-4xl py-4">{quizdata.mondai}</div>
    <div class="bg-white/40 flex flex-col justify-around flex-grow items-center">
      {#each quizdata.taku as t}
        <AnswerButton
          isGrayout={state === AnswerState && quizdata.seikai !== t}
          on:click={() => answerButtonClicked(quizdata.seikai === t)}>
          {t}
        </AnswerButton>
      {/each}
    </div>

    {#if state === AnswerState}
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center items-center">
        <img src={answerImage} alt="正誤判定" class="w-100" />
      </div>
    {/if}
  {/if}
</main>

<GameoverModal bind:this={gameoverModal} on:click={changeToTitle} />
