<script>
    import { createEventDispatcher } from 'svelte';
    import {insertScoreAsync} from './supabase.js';
    import FancyScore from './FancyScore.svelte';

    const dispatch = createEventDispatcher();
    let modal;
    let score;

    
    let name = "";
    let scorelist = FancyScore.getScorelist;

    export function showModal(currentScore){
        score = currentScore;
        name = localStorage.getItem("name") ?? ""; // nullが帰ってきたら空文字""を代入
        modal.showModal();
    }
    export function closeModal(){
        modal.close();
    }
    function okButtonClicked(){
        localStorage.setItem("name", name); // ブラウザに名前を保存
        insertScoreAsync(name, score);
        dispatch("click");
    }
</script>

<dialog bind:this={modal} class="border rounded-xl backdrop-blur-sm bg-white/30 p-10">
    <div class="text-center text-gray-700 flex flex-col items-center gap-10">
        <div class="text-2xl font-extrabold">Time is Up!</div>
        <div class="text-xl font-bold">
            スコア:{score}
        </div>
        <div class="text-xl font-bold">正答率:{score}</div>
        
        <input bind:value={name} type="input" placeholder="名前の入力" class="p-3 border-none focus:outline-none rounded-xl w-full"/>
        <button on:click={okButtonClicked} class="text-xl w-1/2 border-2 border-gray-500 rounded-xl">OK</button>
    </div>
</dialog>