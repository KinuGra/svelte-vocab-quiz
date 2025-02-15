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

/** ルーム作成 */
export async function createRoomAsync(roomId){
    const { error } = await supabase
        .from('Room')
        .insert({ roomId, user:"parent", state:"prepare", score:0 });
    if (error) {
        console.error(error);
    }
}

/** ルーム参加 */
export async function searchRoomId(roomId) {
    const { data, error } = await supabase
        .from('Room') // テーブル名を指定
        .select('roomId') // すべてのカラムを取得（必要に応じてカラムを指定）
        .neq('roomId', '') // not equal : 空文字でないデータのみ取得
        .eq('roomId', roomId); // roomIdが一致するデータを取得
    if (error) {
        console.error('Error fetching rooms:', error)
        return null;
    }

    // データが存在するときのみ処理を実行
    if (data?.length) {
        return true;
    }
    console.log('一致する roomId が見つかりません');
    return false;
}

/** ルーム参加者のデータを追加 */
export async function insertChildDataAsync(roomId){
    const { error } = await supabase
        .from('Room')
        .insert({ roomId, user:"child", state:"ongoing", score:0 });
    if (error) {
        console.error(error);
    }
}

// roomIdが一致する行のstateを更新する関数
export async function updateRoomStateAsync(roomId, user, newState) {
    const { data, error } = await supabase
        .from('Room') // テーブル名
        .update({ state: newState }) // 更新するカラムと値
        .eq('roomId', roomId) // 条件（roomIdが一致する行を更新）
        .eq('user', user); // userが'parent'のみ更新
    if (error) {
        console.error('Error updating room state:', error);
        return null;
    }

    console.log('Room state updated successfully:', data);
    return data;
}