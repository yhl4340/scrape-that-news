

// GRAB ALL ARTICLES 
function getResults(){
    // $('#articles').empty();
    $.getJSON('/all', function (data){
        console.log('am i getting anything?',data)
        for(var i = 0; i < data.length; i ++){
        var myCol = $('<div class="col py-4"></div>');
        var myPanel = $(
            '<div class="card card-outline-info"><div class="card-block"><div class="card-title"><p>Title:"' +
            data[i].title+
            '" </p><br/><p data-id=' + data[i].id + " ' ></p><button type=\"button\" class=\"close\" data-target=\"#" +
            i +
            'Panel" data-dismiss="alert"><span class="float-right"><i class="fa fa-remove"></i></span></button></div><p>Summary: ' + data[i].summary + '"<br/>'+ 'Link: http:'+ data[i].link + " </p><br/><p>Date Created:' " + data[i].dateCreated+ "'</div></div>'");

            var myBtn = $("<button data-id='"+ data[i].id + "'class='btn-note btn btn-outline-primary btn-sm' data-toggle='modal' data-target='#scrape-modal'>Save Note</button>");

        myBtn.appendTo(myPanel);
        myPanel.appendTo(myCol);
        myCol.appendTo("#articles");
    };
    });
};

// display all scraped articles to browser.working
 $('#submit').on('click',function(e){
     e.preventDefault();
     $('#scrape-modal').hide();
     console.log('clicked');
     getResults();
 });

// modal for notes. when the button is clicked, ajax post to server. send data from form to server
 $(document).on('click','.btn-note', function(){
     
     console.log('modal btn');
    //  $('#scrape-modal').show();
     $('#note').empty
     var selected = $(this).attr('data-id');
     $.ajax({
         type:"POST",
         dataType:'json',
         url:'/articles/' + selected,
         data:{
             title: $('#title').val().trim(),
             note: $('#note').val().trim(),
             created: Date.now()
         }
     })
     .then(function(data){
        console.log('data for notes',data);
        $('#title').append('<h5>' + data.title + '</h5>');
        // enter new title
        $('#note').append("<input id='titleinput; name= 'title >");
        
    // text area for text body
        $('#note').append('<textarea id = "bodyinput" name= "body"></textarea>');
        
        // A btn to submit a new note. w the id of the article saved to it
        $("#note").append("<button data-id='"+ data._id + "'id= 'savenotes'>Save Note</button>");

        if(data.note){
            $('#titleinput').val(data.note.title);
            $('#bodyinput').val(data.note.body);
        }
       
     });
 });