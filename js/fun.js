let funButton = document.querySelector('#myonoffswitch');
let allButtons = document.getElementsByTagName('button')
funButton.addEventListener('click', function(e){
    if(funButton.checked){
        for(let i=0;i<allButtons.length;i++){

            allButtons[i].classList.add('color-active');
        }
    } else{
        for(let i=0;i<allButtons.length;i++){

            allButtons[i].classList.remove('color-active');
        }
    }
})
