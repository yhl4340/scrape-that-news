

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
            '" </p><br/><p data-id=' + data[i]._id + " ' ></p><button type=\"button\" class=\"close\" data-target=\"#" +
            i +
            'Panel" data-dismiss="alert"><span class="float-right"><i class="fa fa-remove"></i></span></button></div><p>Summary: ' + data[i].summary + '"<br/>'+ 'Link: http:'+ data[i].link + " </p><br/><p>Date Created:' " + data[i].dateCreated+ "'</div></div>'");
            // console.log(data[i]._id,'panel id')

            var myBtn = $("<button data-id='"+ data[i]._id + "'class='btn-note btn btn-outline-primary btn-sm' data-toggle='modal' data-target='#scrape-modal' >Save Note</button>");
           
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

// modal for notes. when the button is clicked, ajax post to server. send data from form to server.Save a note
// NOT WORKING
 $(document).on('click','.btn-note', function(){
     
     console.log('modal btn');
    //  $('#scrape-modal').show();
     $('#notes').empty
     var selected = $(this).attr('data-id')
     console.log('data-id',selected)
     $.ajax({
         type:"GET",
        //  dataType:'json',
         url:'/articles/' + selected
        //  data:{
        //      title: $('#title').val().trim(),
        //      note: $('#note').val().trim(),
        //      created: Date.now()
        //  }
     })
     .then(function(data){
        console.log('data for notes',data);
        
        $('.notes-title').append('<h5>' + data.title + '</h5>');
        // enter new title
        // $('#notes-title').append("<input id='titleinput; name= 'title >");
        
    // text area for text body
        $('.notes').append('<textarea id = "bodyinput" name= "body"></textarea>');
        
        // A btn to submit a new note. w the id of the article saved to it
        $(".notes").append("<button data-id='" + data._id + "' id='savenote' class='btn btn-primary btn-sm align-item-end' 'data-dismiss='modal'>Save Note</button>");
        
        if(data.note){   
            $('#bodyinput').val(data.note.body);
        }
     });
 });

// WHEN CLICKING ON SAVENOTE BTN
$(document).on('click','#savenote',function(){
    var thisId = $(this).attr('data-id');
    $.ajax({
        type:'POST',
        dataType:'json',
        url:'/articles/'+ thisId,
        data: {
            body:$('#bodyinput').val(),
            // title:$ ('#titleinput').val(),
            // created:Date.now()
        }
    })
    .then(function(data){
        console.log('saving notes', data);
    });
    $('#bodyinput').val('');
    $('#titleinput').val('');
});