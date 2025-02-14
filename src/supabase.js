import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://qtvupqmejznswayexraz.supabase.co'; // プロジェクトによる
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0dnVwcW1lanpuc3dheWV4cmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNDIxODcsImV4cCI6MjA1NDgxODE4N30.erzGRYZbPmGc-6pTsOhmyxYPT04w8MEDph8ijU5iZFA'; // プロジェクトによる
const supabase = createClient(supabaseUrl, supabaseKey);

/** データベースからidsの行のtango, imiの抽出 */
export async function fetchTangoImiAsync(ids, mondaiDatabaseIndex){
    const { data, error } = await supabase
        .from(mondaiDatabaseIndex)
        .select('tango, imi')
        .in('id', ids);
    if (error) {
        console.error(error);
    }
    return data;
}

/** データベースのレコード数を取得 */
export async function fetchMondaisuAsync(mondaiDatabaseIndex){
    const { error, count } = await supabase
        .from(mondaiDatabaseIndex)
        .select('*', { count: 'exact', head: true});
    if (error) {
        console.error(error);
    }
    return count;
}



/** 名前、スコアをデータベースに書き込む */
export async function insertScoreAsync(name, score){
    const { error } = await supabase
        .from('Ranking')
        .insert({ name, score }); // name:name, score:scoreを省略
    if (error) {
        console.error(error);
    }
}

/** スコアの取得 */
export async function fetchRankingAsync(){
    const { data, error } = await supabase
        .from('Ranking')
        .select("score, name")
        .neq('name', '') // not equal : 空文字でないデータのみ取得
        .order('score', {ascending: false}) // 降順
        .limit(10); // 出力は最大10件
    if (error) {
        console.error(error);
    }
    return data;
}