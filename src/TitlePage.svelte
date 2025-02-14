<script>
    import RankingModal from "./RankingModal.svelte";
    let rankingModal;
    function showRanking(){
        rankingModal.showModal();
    }
</script>

<div class="flex flex-col justify-center items-center h-svh gap-14">
    <div class="text-7xl font-extrabold backdrop-blur-sm bg-white/10 p-4 rounded-2xl">
        Quiz
    </div>
    <div class="text-4xl font-extrabold backdrop-blur-sm bg-white/20 p-3 px-6 rounded-xl">
        英単語で目指せハイスコア！
    </div>
    <button on:click class="bg-cyan-500 text-white font-bold text-3xl rounded-full border-2 p-4 w-1/2">
        スタート
    </button>
    <button on:click={showRanking} class="bg-cyan-500 text-white font-bold text-3xl rounded-full border-2 p-4 w-1/2">
        ランキング
    </button>
</div>

<RankingModal bind:this={rankingModal}/>