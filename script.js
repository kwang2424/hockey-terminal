$('body').terminal({
    cat: function(width, height) {
        return $('<img src="https://placekitten.com/' +
                 width + '/' + height + '">');
    },
    title: function() {
        return fetch('https://terminal.jcubic.pl')
            .then(r => r.text())
            .then(html => html.match(/<title>([^>]+)<\/title>/)[1]);
    }, 
    player: function() {
        
    }
}, {
    greetings: 'My First JavaScript Terminal\n'
});