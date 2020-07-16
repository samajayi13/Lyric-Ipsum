 <?php
    include "simple_html_dom.php";
    
    $aResult = array();

    if( !isset($aResult['error']) ) {

        switch($_POST['functionname']) {
            case "scrap_url":
               $aResult['result'] =  scrap_url($_POST["arguments"][0],$_POST["arguments"][1]);
            break;
            case "scrap_sentences":
                 echo "<script> console.log('here!!'); </script>";
               $aResult['result'] = file_get_html('https://thejohnfox.com/beautiful-sentences')->plaintext;
            break;
                
            default:
               $aResult['error'] = 'Not found function '.$_POST['functionname'].'!';
               break;
        }

    }


    //Function scraps song from genisus and then crops the plaintext
    function scrap_url($artist, $song_name) {
        if(strpos($song_name,"(") > 0 ){
            $song_name = substr($song_name,0,strpos($song_name,"(")-1);
        }

        if(strpos($artist,"feat") > 0 ){
            $artist = substr($artist,0,strpos($artist,"feat"));
        }

        $artist = filer_var($artist);
        $song_name = filer_var($song_name);
        $artist = ucwords(str_replace(" ","-",$artist));
        $song_name = ucwords(str_replace(" ","-",$song_name));
        $url = sprintf('https://genius.com/%s-%s-lyrics',$artist,$song_name);
        $url = str_replace("--","-",$url);
        $lyrics = "";

        do{
            $lyrics = file_get_html($url)->plaintext;
            $start_index = strpos($lyrics,"Verse");
            $end_index =strpos($lyrics,"Contributors");
            $lyrics =  substr($lyrics,$start_index,$end_index - $start_index);
        }while(strpos($lyrics,"More on Genius")>1);

        return $lyrics;
    }

    //function removes special characters from the song and artist name 
    function filer_var($var) {
        $chars = array("!",'”','#','$','%','&',"’",'(',')','*','+',',','.','/',':','',';',
            '<','=','>','?','@','[',"\"",']','^','_','`','{','|','}','~','--',"'",'\'','"',"\"","-");
        foreach($chars as $char){
            $var = str_replace($char,"",$var);
        }
        return $var;
    }

    echo json_encode($aResult);
?>