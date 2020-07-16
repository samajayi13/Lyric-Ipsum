var getResultsBtn = document.querySelector(".btn-result");
var singer = document.querySelector(".singer");
var song = document.querySelector(".song");
var wordsObj = {};
var lyrics = [];
var sentenceCount = 0;
var paragraphCount = 0;
var paragraph = false;
var numberOfSentence  = 0 ;

//Function that animates the inputs
$(document).ready(function(){
    $("#search1").focus(function() {
      $(".search-box").addClass("border-searching");
      $(".search-icon").addClass("si-rotate");
    });
    $("#search1").blur(function() {
      $(".search-box").removeClass("border-searching");
      $(".search-icon").removeClass("si-rotate");
    });
    $("#search1").keyup(function() {
        if($(this).val().length > 0) {
          $(".go-icon").addClass("go-in");
        }
        else {
          $(".go-icon").removeClass("go-in");
        }
    });
    $(".go-icon").click(function(){
      $(".search-form").submit();
    });
});

//Event listener that turns first letter of the user input into capital 
song.addEventListener("input",function(){
    this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1);
});

//Event listener that turns first letter of the user input into capital 
singer.addEventListener("input",function(){
    this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1);
});

//Function pauses the execution of the application for the set amount of time
function wait(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}

//Capitalizes first letter of string
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

//Function outputs the lorem ipsum into textarea and creates button for user to click on if they want the lorem ipsum for another song
function outputLoremIpsum(loremIpsum) {
    let section = document.querySelector("section");
    section.innerHTML = "";
    let textarea =  document.createElement("textarea");
    document.querySelector(".spinner-border").style.display = "none";
    textarea.value = loremIpsum;
    section.appendChild(textarea);
    let div = document.createElement("div");
    div.innerHTML = '<div class="wrapper"> <button class="btn btn-back text-center bordered btn-lg btn-success">Try another song</button> </div> ';
    section.appendChild(div);
    document.getElementsByTagName("textarea")[0].readOnly = true;
}

function addSentenceToLoremIpsum(loremIpsum, numOfWordsToAdd, firstWord=false) {
    let randomIndex = 0;
    let count = 0;
    let i = 0;
    paragraph = false;
    
    do{
        randomIndex = Math.floor(Math.random() *((Object.keys(wordsObj).length -1) - 0 +1 ));
    }while(randomIndex + numOfWordsToAdd >= Object.keys(wordsObj).length -1);
    
    numOfWordsToAdd = randomIndex + numOfWordsToAdd;
    i = randomIndex;
    count = randomIndex;
    
    while(i < numOfWordsToAdd){
        if(wordsObj[`${count}`] !== undefined){
            if(i === randomIndex){
                loremIpsum += firstWord === true ?wordsObj[`${count}`].capitalize() : " " + wordsObj[`${count}`].capitalize();
            }else{
                loremIpsum +=" " + wordsObj[`${count}`];
            }

            if(i === numOfWordsToAdd-1){
                loremIpsum+=".";
                sentenceCount += 1;
                console.log(sentenceCount);

                if(sentenceCount === numberOfSentence){
                    loremIpsum +="\n\n";
                    console.log("should be new para");
                    paragraphCount += 1;
                    paragraph = true;
                    numberOfSentence =Math.floor(Math.random() * 8) + 4;
                    sentenceCount = 0;
                }
            } 
            i += 1;
        }
        count += 1;

    }
    
    return loremIpsum;
    
}

//Function create object of lyrics and deletes any key value pairs that are undefined or empty
function validateObject() {
    for(let i = 0; i<= lyrics.length-1; i ++){
        wordsObj[`${i}`] = lyrics[i];
    }
    
    for(let key of Object.keys(wordsObj)){
        if(wordsObj[key] === undefined || wordsObj[key].trim() === "" || wordsObj[key].trim().length <=0){
            delete wordsObj[key];
        }
    }
}

async function createLoremIpsum() {
    let indexs = [];
    let sentence = "";
    
    validateObject();
    numberOfSentence = Math.floor(Math.random() * 8) + 4;
    sentence = addSentenceToLoremIpsum(sentence,15,true);
    
    while( paragraphCount < 3){
        let randNum  = Math.floor(Math.random() * 20) + 10;
        sentence = paragraph ? addSentenceToLoremIpsum(sentence,randNum,true) : addSentenceToLoremIpsum(sentence,randNum,false);

    }
    
    outputLoremIpsum(sentence);
}

String.prototype.splice = function(start, delCount, newSubStr) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
};

function scrapLyricsFromGenius (artistName, trackName) {
    $.ajax({
        type: "POST",
        url:"scrap_url.php",
        dataType: 'json',
        data: { functionname:"scrap_url", arguments:[artistName,trackName] },
        success: function (obj, textstatus) {
            var alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

            if (!('error' in obj)) {
                obj.result = obj.result.split("&#x27;").join("");
                obj.result = obj.result.split("Chorus").join("");
                obj.result = obj.result.split("Verse").join("");
                obj.result = obj.result.split("About").join("");
                obj.result = obj.result.replace(/(\r\n|\n|\r)/gm, "");
                obj.result = obj.result.split("").filter(function(x){
                    let lowerCaseAlphabet = "abcdefghijklmnopqrstuvwxyz ";
                    return (lowerCaseAlphabet.includes(x.toLowerCase()) === true);
                }).join("");
                
                for(let i = 1; i <= obj.result.length-1; i++){
                    if(alphabets.includes(obj.result[i]) === true && (obj.result[i-1] !== " ")){
                        obj.result = obj.result.splice(i,0," ");
                    }
                }
                
                obj.result = obj.result.toLowerCase();
                lyrics = obj.result.split(" ");
                
                createLoremIpsum();
            }
            else {
                console.log(obj.error);
            }
        },
        error: function (err) {
            console.log(err);
        }
    }); 
}

//Function takes the user input for song and singer input fields and checks if the song is valid
function main(){
    singer = document.querySelector(".singer").value.trim().toLowerCase();
    song = document.querySelector(".song").value.trim().toLowerCase();
    document.querySelector(`.error-singer`).innerText = "";
    document.querySelector(`.error-song`).innerText = "";
     
    if(checkIfFieldIsEmpty(singer,"singer") === true && checkIfFieldIsEmpty(song,"song") === true) {
        axios.get(`https://cors-anywhere.herokuapp.com/http://api.musixmatch.com/ws/1.1/track.search?q_artist=${singer}&page_size=3&page=1&s_track_rating=desc&q_track=${song}&apikey=f1f120fb1cbb945c6e1d32e14eb04405`)
        .then(async function({data}){
            if (data.message.body.track_list.length === 0){
                alert("Sorry song could not be found.Please try another song");
            }else{
                document.querySelector(".spinner-border").style.display = "block";
                let track = data.message.body.track_list[0].track;
                let artistName = track.artist_name;
                let trackName = track.track_name;

                await scrapLyricsFromGenius(artistName,trackName);
                await wait(7000);
                if(lyrics.length === 0){
                    alert("Sorry song could not be found.Please try another song");
                    document.querySelector(".spinner-border").style.display = "none";
                }
            }

        })
        .catch(x=>{
            console.log(x);
        })
        return Promise.resolve();
    }
    
}

getResultsBtn.addEventListener("click",function() {
    main();
});

//Chckes if the inputs are empty 
let checkIfFieldIsEmpty = function(input, name) {
    if(input === "" || input === null){
        let errMessage = document.querySelector(`.error-${name}`);
        errMessage.innerText = `${name} is missing`;
        return false;
    }else{
        return true;
    }
}

song.addEventListener("keypress",function(e) {
    if(e.keyCode ===13){
        e.preventDefault();
        main();
    }
});


document.addEventListener("click",function(e) {
    if(e.target.classList.contains("btn-back")){
        location.reload();
    }
});
