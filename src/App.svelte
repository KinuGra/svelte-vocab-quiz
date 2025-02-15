<script>
  import {onMount, tick} from 'svelte';
  import AnswerButton from "./AnswerButton.svelte";
  import "./app.css";
  import {getQuizdataAsync} from "./quizdataFactory";
  import TitlePage from "./TitlePage.svelte";
  import Progressbar from './Progressbar.svelte';
  import GameoverModal from './GameoverModal.svelte';
  import FancyScore from './FancyScore.svelte';


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
  let score;

  const music = new Audio("src/assets/sound/bgm.mp3")

  

  /** 起動時に一度呼び出す：ライフサイクル関数 */
  onMount(changeToTitle);

  /** 状態遷移のための関数群 */
  function changeToTitle(){
    gameoverModal.closeModal();
    state = TitleState;
  }
  async function changeToQuestionAsync(){
    // スコアに応じて難易度調整
    // TODO 難易度を変化させる点数の調整
    if(score <= 15){
      quizDifficulty = VeryEasy;
      haikei = '/src/assets/_school_in_spring_1.jpg';
    } else if(score <= 30){
      quizDifficulty = Easy;
      haikei = '/src/assets/_school_in_spring_2.jpg';
    } else if(score <= 65){
      quizDifficulty = Normal;
      haikei = '/src/assets/library_3.jpg';
    } else if(score <= 100){
      quizDifficulty = Hard;
      haikei = '/src/assets/Torii-gate-and-the-first-sunrise-of-the-New-Year1.jpg';
    } else{
      quizDifficulty = VeryHard;
      haikei = '/src/assets/Candles-and-candlesticks3.jpg';
    }
  music.play()

    quizdata = await getQuizdataAsync(quizDifficulty); // 問題画面に遷移するたびにクイズデータを取得
    state = QuestionState;
  }
  function changeToAnswer(){ // 解答を表示する状態
    /* Answer状態のときにGameover状態に遷移するとsetTimeoutによってQuestion状態に遷移してしまうことに注意 */
    state = AnswerState;
    setTimeout(()=>{
      if(state===AnswerState){ // 中断などで状態を遷移した後に問題画面に遷移しないようにしておく
        changeToQuestionAsync();
      }
    }, 1000); // 1000ms後に問題画面に遷移
  }
  function changeToGameover(){
    state = GameoverState;
    music.pause();
music.currentTime = 0;
    gameoverModal.showModal(fancyScore.getScore());
  }
  function changeToQuizstart(){
    const startSound = new Audio("src/assets/sound/click.mp3")
    startSound.play()

    state = QuizStart;
    time = maxTime;
    quizDifficulty = VeryEasy;
    score = 0;

    const timer = setInterval(()=>{
      if(state===QuestionState && time<0){
        clearInterval(timer);
        changeToGameover();
      }
      if(state===QuestionState){
        time -= 0.01; // 細かい数値ほど滑らかにプログレスバーが動くが負荷が大きくなる
      }
    }, 10); // 10ms=0.01秒ごとにtimeを0.01減らすことで、1秒ごとに1減らす
    changeToQuestionAsync();
  }

  /** 選択肢ボタンがクリックされたときの処理 */
  function answerButtonClicked(isCorrect){
    if(state!==QuestionState) return;

    if(isCorrect){
    // 正解した時の処理
      const successSound = new Audio("src/assets/sound/success.mp3")
      successSound.play()
    }
    
    fancyScore.updateScore(isCorrect); // スコア更新
    score = fancyScore.getScore(); // 難易度分岐用のスコアの更新



    if(fancyScore.getRenzokuSeikai()>=5){
      time = Math.min(time+1, maxTime);
    }
    else if(!isCorrect){
      // 間違えた時の処理
      time -= 1;

      //　ここに不正解音をつける
      const errorSound = new Audio("src/assets/sound/error.mp3")
      errorSound.play() 

    }
    changeToAnswer();
  }
</script>

<svelte:head>
  <title>QuizApp</title>
</svelte:head>

<main style="background-image: url({haikei})" class = "bg-cover flex flex-col h-svh">
  {#if state===TitleState}
    <div class="bg-[url('/src/assets/_school_in_spring_1.jpg')] bg-cover">
      <TitlePage on:click={changeToQuizstart}></TitlePage>
    </div>
  {:else if state===QuestionState || state===AnswerState || state===GameoverState}
    <!-- メニューバー --> <!-- FancyScoreはTitleに戻るときに消え、QuestionStateに戻るたびに再度作成され、currentScoreなどは初期化される -->
    <FancyScore bind:this={fancyScore}/> <!-- スコア、連続正解数、トランジションの表示 -->

    <!-- プログレスバー --> <!-- <Progressbar/>は省略記法 -->
    <Progressbar maxTime={maxTime} time={time}/> <!-- プロパティ名を省略して書くこともできる <Progressbar {maxTime} {time}/> -->

    <!-- 問題 -->
    <div class="bg-white/60 font-extrabold text-center text-4xl py-4">{quizdata.mondai}</div>

    <!-- 選択肢 -->
    <div class="bg-white/40 flex flex-col justify-around flex-grow items-center">
      {#each quizdata.taku as t}
        <!-- 不正解の選択肢の色を変える -->
        <AnswerButton
          isGrayout={state===AnswerState && quizdata.seikai!==t}
          on:click={() => answerButtonClicked(quizdata.seikai===t)}>{t}
        </AnswerButton>
      {/each}
    </div>
  {/if}
</main>

<GameoverModal bind:this={gameoverModal} on:click={changeToTitle}/>