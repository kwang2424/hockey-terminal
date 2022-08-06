/** This is the script for hockey terminal, a small little passion project that I decided to make.
 *  All of the code is written in JavaScript and uses jQuery Terminal.
 *  The project is just a terminal interface for simple hockey statistics, though I will adding more later.
 *  By: kevy729
 */

/**
 * teamsInfo takes in data fetched from the NHL api and puts
 * the necessary information (name, abbreviation, roster, and id) into
 * an array and returns that array
 * @param {1} data - the json data fetched from the api 
 * @returns - array with necessary information
 */
function teamsInfo(data) {
    // use an array for each important piece of information
    let abbs = [];
    let names = [];
    let rosters = [];
    let ids = [];

    // since users may input different types of names and the json data
    // has multiple different names, we will check each one in the data
    // to find a potential match (so use this to quickly check each name type)
    let name_types = ['locationName', 'name', 'shortName', 'teamName'];
    
    // go through each team and add their information into the array
    for (let i=0; i<data['teams'].length; i++) {
        abbs.push(data['teams'][i]['abbreviation'].toLowerCase());
        rosters.push(data['teams'][i]['roster']['roster']);
        ids.push(data['teams'][i]['id']);

        // for checking names
        for (let j=0; j<name_types.length; j++) {
            names.push(data['teams'][i][name_types[j]].toLowerCase());
            
        }
    }

    // return as a dictionary 
    return {'team_names': names, 'team_abbs': abbs, 'rosters': rosters, 'ids': ids};
}

/**
 * given a team from the user, try to match it with the data from the api
 * throws error if no match, else returns the id of the matched team
 * @param {1} team - user's input 
 * @returns - the team id
 */
async function matchTeam(team) {
    // fetch all teams from the api
    let obj;

    const res = await fetch('https://statsapi.web.nhl.com/api/v1/teams?expand=team.roster');

    obj = await res.json();

    // call teamsInfo and get the important information in an array (names, abbreviations, ids, etc...)
    let teams = teamsInfo(obj);
    let abbs = teams['team_abbs'];
    let names = teams['team_names'];
    let ids = teams['ids'];

    // since there are multiple name types we are checking, use a ratio to help when looping
    let ratio = names.length / abbs.length;

    // lowercase helps with comparisons
    team = team.toLowerCase();

    // default index in case we don't get match
    let index = -1;

    // loop through all 32 teams
    for (let i=0; i<abbs.length; i++ ) {
        // try to see if team name matches the api's abbreviation
        if (abbs[i] == team) {
            index = ids[i];
            break;
        }
        // see if team name matches one of the various names (name_types in the method teamInfo)
        for (let j=0; j<ratio; j++) {
            // use ratio to help with index calculations
            if (names[j + ratio * i] == team) {
                console.log(names[j+ratio*i])
                index = ids[i];
                break;
            }
        }
    }
    return index;
}

/**
 * matchTeamPlayer just tries to match the player in a certain to team to see if they exist
 * @param {1} name - player name (first + last)
 * @param {2} team - team name
 * @returns - player id if they exist, else throws error
 */
async function matchTeamPlayer(name, team) {
    // fetch team roster info
    let obj;

    const res = await fetch('https://statsapi.web.nhl.com/api/v1/teams?expand=team.roster');

    obj = await res.json();
    
    // use teamsInfo to get relevant info
    let teams = teamsInfo(obj);
    let abbs = teams['team_abbs'];
    let names = teams['team_names'];
    
    let ratio = names.length / abbs.length;

    // lowercase for comparions
    team = team.toLowerCase();
    name = name.toLowerCase();

    // default, use for throwing errors
    let index = -1;
    
    // looking for team match
    for (let i=0; i<abbs.length; i++ ) {
        
        if (abbs[i] == team) {
            index = i;
            break;
        }
        for (let j=0; j<ratio; j++) {
            if (names[j + ratio * i] == team) {
                index = i;
                break;
            }
        }
    }
    // throw error if no match (since default is -1)
    if (index < 0) {
        throw new Error("No team match.");
    }
    //default
    let id = -1;
    
    // use team roster to try and match player
    let roster = teams['rosters'][index]
    for (let i=0; i<roster.length; i++) {
        console.log(roster[i]['person']['fullName']);
        if (name == roster[i]['person']['fullName'].toLowerCase()) {
            id = roster[i]['person']['id'];
        }
    }
    // throw error if no match
    if (id < 0) {
        throw new Error("No player match.");
    }
    return id;
}

/**
 * gets all teams in a conference
 * @param {1} conference - conference name (east or west)
 * @returns - array of all teams in the conference
 */
async function getConfTeams(conference) {
    conference = conference.toLowerCase();
    
    // all valid answers for conference
    valid_confs = ['eastern', 'east', 'western', 'west'];
    
    // if input is not valid, throw error
    if (!valid_confs.includes(conference)) {
        throw new Error("Could not find specified conference.");
    }

    // for matching purposes with api
    if (conference == 'eastern' || conference == 'east') {
        conference = 'Eastern';
    } else {
        conference = 'Western';
    }

    // fetch teams information from api
    let obj; 

    const res = await fetch('https://statsapi.web.nhl.com/api/v1/teams');

    obj = await res.json();

    // store teams in array
    // first value is conference name, this is just used to make it easier to print out
    // the conference name in the terminal body
    let conf_teams = [conference];

    // array of teams from the api
    let teams = obj['teams'];

    // iterate through all 32 teams and store those who are in the correct conference
    for (let i=0; i<teams.length; i++) {
        if (teams[i]['conference']['name'] == conference) {
            conf_teams.push(teams[i]['name']);
        }
    }
    return conf_teams;
}

/**
 * gets all teams in the specified division
 * @param {1} division - division name (central, metropolitan, atlantic, pacific)
 * @returns - array of all teams in division
 */
async function getDivTeams(division) {
    // for comparison
    division = division.toLowerCase();

    // all valid division names
    valid_divs = ['a', 'atlantic', 'atl', 'c', 'central', 'cen', 'm', 'metropolitan', 'metro', 'p', 'pacific', 'pac']
    if (division == 'met') division = 'metro';

    // if division is not valid, throw error
    if (!valid_divs.includes(division)) {
        throw new Error("Division could not be found.");
    }

    // fetch teams info
    const res = await fetch('https://statsapi.web.nhl.com/api/v1/teams');
    
    obj = await res.json();

    let div_teams = [];
    let teams = obj['teams'];

    // iterate through all teams and find matches
    for (let i=0; i<obj['teams'].length; i++) {
        if (teams[i]['division']['name'].toLowerCase() == division ||
            teams[i]['division']['abbreviation'].toLowerCase() == division ||
            teams[i]['division']['nameShort'].toLowerCase() == division) {
                // like conferences, use this for printing purposes in terminal body
                if (div_teams.length == 0) {
                    div_teams.push(teams[i]['division']['name']);
                }
                div_teams.push(teams[i]['name']);
            }
    }

    return div_teams;
}

/**
 * turns string into title case
 * @param {1} str - string to be turned into title case
 * @returns - title case version of string
 */
function toTitleCase(str) {
    // use string replace to turn first characters to upper case, and all other characters to lower case
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
}

/** 
 * jQuery Terminal body, contains all the commands for the terminal 
 */
$('body').terminal({
    // command for to return player statistics
    player: function() {
        // push multiple functions as we need to get player first name, last name, and team
        this.push(function(name) {
            this.push(function(last_name) {
                this.push(function(team) {
                    // remove white space
                    name = name.replace(/\s/g, '');
                    last_name = last_name.replace(/\s/g, '');
                    // used to catch errors if player could be not be matched
                    try {
                        // given name and team, match player
                        matchTeamPlayer(name + ' ' + last_name, team)
                        // if good, then use the player id to fetch the player api
                        .then(async (id) => {
                            // used for printing in echo
                            name = toTitleCase(name);
                            last_name = toTitleCase(last_name);
                            
                            // fetch player regular season stats
                            await fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}/stats?stats=careerRegularSeason`)
                            .then(res => res.json())
                            .then((data) => {
                                this.echo('\n' + name + ' ' + last_name)
                                this.echo('\nRegular Season Stats:')
                                // use keys to help iterate through the player stats and for formatting
                                let keys = Object.keys(data['stats'][0]['splits'][0]['stat']);
                                // use key name at beginnning of stats for formatting' ssake
                                let key_name;
                                // iterate through each stat and echo/print it
                                for (let i=0; i<keys.length; i++) {
                                    key_name = keys[i]
                                    this.echo('\t' + key_name + ': ' + data['stats'][0]['splits'][0]['stat'][key_name]);
                                }
                            })
                            // if error print out error
                            .catch((err) => this.echo('\n' + err + '\n'));
                            
                            // fetch player playoff stats
                            await fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}/stats?stats=careerPlayoffs`)
                            .then(res => res.json())
                            .then((data) => {
                                this.echo('\nPlayoff Stats:')
                                let keys = Object.keys(data['stats'][0]['splits'][0]['stat']);
                                let key_ind;
                                for (let i=0; i<keys.length; i++) {
                                    key_ind = keys[i]
                                    this.echo('\t' + key_ind + ': ' + data['stats'][0]['splits'][0]['stat'][key_ind]);
                                }
                                this.echo();
                            
                            })
                            // if error, there will be error above already, so no need to reprint
                            .catch((err) => {});
                        })
                        // error catch
                        .catch((err) => this.echo('\n' + err + '\n'));
                    } catch (err) {
                        this.echo('\n' + err + '\n');
                    }
                this.pop().pop().pop();
                // prompts for each function
            }, {
            prompt: 'team: '
        })  
        }, {
            prompt: 'last name: '
        })
    }, {
        prompt: 'first name: '
    })
    },
    // command to get team statistics
    team: async function(team) {
        // use matchTeam to see if player input matches real team
        await matchTeam(team)
        // then try and fetch the team information
        .then(async (id) => {
            try {
                await fetch(`https://statsapi.web.nhl.com/api/v1/teams/${id}`)
                .then(res => {
                    // check if fetch is good
                    if (!res.ok) {
                        throw new Error("Team could not be found.")
                    }
                    return res.json()
                })
                // print out basic team info
                .then((data) => {
                    this.echo('\nTeam Info')
                    this.echo('\tConference: ' + data['teams'][0]['conference']['name'])
                    this.echo('\tDivision: ' + data['teams'][0]['division']['name'])
                    this.echo('\tVenue: ' + data['teams'][0]['venue']['name'])
                })
            } catch (err) { 
                // don't want spam in terminal / console, if error in one we will ahve error
                // all 3 so print it out in the last one
            }
            // now time to print out more detailed stats
            try {
                await fetch(`https://statsapi.web.nhl.com/api/v1/teams/${id}/stats`)
                .then(res => {
                    // ensuring fetch is good
                    if (!res.ok) {
                        throw new Error("Team could not be found.")
                    }
                    return res.json()
                })
                // if fetch is good, then we print out team statistics for the current season
                .then((data) => {
                    let keys = Object.keys(data['stats'][0]['splits'][0]['stat'])
                    let key_ind;
                    this.echo('')
                    this.echo('Current Season Statistics')

                    // go through each stat, some stats have rankings while others don't
                    for(let i=0; i<keys.length; i++){
                        key_ind = keys[i]

                        // if stat has no ranking, don't show
                        if (data['stats'][1]['splits'][0]['stat'][key_ind] == undefined) {
                            this.echo('\t' + key_ind + ': ' + data['stats'][0]['splits'][0]['stat'][key_ind])    
                        } else {
                            // if stat has ranking, show it
                            this.echo('\t' + key_ind + ': ' + data['stats'][0]['splits'][0]['stat'][key_ind] + ' - ' + 
                            data['stats'][1]['splits'][0]['stat'][key_ind])
                        }
                    }
                })
            } catch (err) {
                // don't want spam in terminal / console, if error in one we will ahve error
                // all 3 so print it out in the last one
            }
            // print out team roster
            try {
                // fetch roster
                await fetch(`https://statsapi.web.nhl.com/api/v1/teams/${id}/roster`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error("No team match.")
                    }
                    return res.json()
                })
                // print out roster info
                .then((data) => {
                    let jersey_num;
                    let position_abb;
                    let name;
                    this.echo('\nRoster');
                    for (let i=0; i<data['roster'].length; i++) {
                        name = data['roster'][i]['person']['fullName'];
                        jersey_num = data['roster'][i]['jerseyNumber'];
                        if (jersey_num == undefined) jersey_num = 'N/A';
                        position_abb = data['roster'][i]['position']['abbreviation'];
                        this.echo(`\t${position_abb} - ${name} - ${jersey_num}`)
                    }
                    this.echo();
                })
            // catch error
            } catch (err) {
                this.echo("\n" + err + "\n");
            }
        })
    },
    // command to get conference statistics
    conference: async function(conference) {
        // use to catch error if we can not match conference
        try {
            // try to match conference
            await getConfTeams(conference)
            // if match, then we print out the teams
            .then((teams) => {
                this.echo('\n' + teams[0] + ' Conference Teams\n')
                for (let i=1; i<teams.length;i++) {
                    this.echo('\t' + teams[i])
                }
                this.echo('')
            })
        // else let user know there is error
        } catch (err) {
            this.echo('\nError: Could not find specific conference.\n');
        }
    },
    // command to get division statistics
    division: async function(division) {
        // try to match user input to real division
        try {
           await getDivTeams(division)
           // if good, then print out teams
            .then((teams) => {
                this.echo('\n' + teams[0] + ' Teams\n')
                for (let i=1; i<teams.length; i++) {
                    this.echo('\t' + teams[i]);
                }
                this.echo('');
            })
        // if error, let user know
        } catch (err) {
            this.echo('\nCould not find specific division\n');
        }
    },
    // command to list out commands (except help) and their function
    help: function() {
        this.echo('\nList of Commands:\n');
        // use padEnd to ensure descriptions all start from the same spot
        let conf = 'conference [name]';
        this.echo(`${conf.padEnd(25, ' ')} returns a list of all teams in the specified conference`);

        let div = 'division [name]';
        this.echo(`${div.padEnd(25, ' ')} returns a list of all teams in the specified division`);

        let player = 'player';
        this.echo(`${player.padEnd(25, ' ')} returns the stats of the specified player`);

        let team = 'team [name]';
        this.echo(`${team.padEnd(25, ' ')} returns the stats and rosters of the specified team`);
    
        this.echo('');
    }
}, {
    // greetings at top of terminal
    greetings: 'Welcome to Hockey Terminal\n'
});