# encoding: utf-8
require 'csv'
require 'json'

#Parse files provided by the Q2A event logger plugin (see https://github.com/q2a/question2answer/tree/master/qa-plugin/event-logger)
#Conf vars (event logger text file location)
$logfilesource = 'logs'

#Globs
$parray = Array.new
$uarray = Array.new

#Classes
class User
  attr_accessor :userid, :username, :connections
  @userid
  @username
  @connections

  def initialize
    @userid = 0
    @username = ''
    @connections = Array.new
  end
end

class Post
  attr_accessor :postid, :user
  @postid = 0
  @user = nil
end

#Functions
def adduser(uid, uname)
  nuser = User.new
  nuser.userid = uid
  nuser.username = uname
  $uarray[uid] = nuser
  return nuser
end

Dir.foreach('$logfilesource') do |item|
  next if item == '.' or item == '..'
  puts "Processing file " + item.to_s
  File.open($logfilesource + '/' + item, 'r:ISO-8859-1').each do |line|
    #Read or skip line
    ra = line.split("\t")
    tobreak = true
    tobreak = false if (ra[6] == 'a_post' || ra[6] == 'a_select' || ra[6] == 'c_post' || ra[6] == 'a_vote_up' || ra[6] == 'a_vote_down')
    tobreak = false if (ra[6] == 'q_post' || ra[6] == 'q_vote_up' || ra[6] == 'q_vote_down')
    next if tobreak

    #Parse
    pdate     = ra[0] #Date
    ptime     = ra[1] #Time
    pip       = ra[2] #IPaddress
    puid      = ra[3].to_i #UserID, integer
    puname    = ra[4] #Username
    pevent    = ra[6] #Event
    postid    = ra[7].split('=')[1].to_i #Post ID, integer
    parentid  = ra[8].split('=')[1].to_i #Parent ID, integer

    #Process posts
    if ra[6] == 'q_post' then
      npost = Post.new
      if $uarray[puid] then
        npost.user = $uarray[puid]
      else
        npost.user = adduser(puid, puname)
      end
      npost.postid = postid
      $parray[postid] = npost
      #Debug
      puts npost.user.username + " posted a question id " + npost.postid.to_s
    end


    #Process answers and comments
    if (ra[6] == 'c_post' || ra[6] == 'a_post') then
      parentpost = $parray[parentid]
      #Skip if parent not found from logs
      next if parentpost == nil
      parentuser = parentpost.user
      npost = Post.new
      if $uarray[puid] then
        nuser = $uarray[puid]
      else
        nuser = adduser(puid, puname)
      end
      npost.user = nuser
      npost.postid = postid
      $parray[postid] = npost
      nuid = nuser.userid
      # Connection edge weights
      addweight = case ra[6]
        when 'a_post' then 2
        else 1
      end
      if parentuser.connections[nuid].nil? then parentuser.connections[nuid] = addweight else parentuser.connections[nuid] = parentuser.connections[nuid] + addweight end
      #Debug
      puts nuser.username + " commented/answered on " + parentuser.username + " msg " + parentpost.postid.to_s
    end

    #Process votes (reverse graph direction, rewarding)
    #Reward voting
    if (ra[6] == 'q_vote_up' || ra[6] == 'q_vote_down' || ra[6] == 'a_select' || ra[6] == 'a_vote_up' || ra[6] == 'a_vote_down') then
    #Reward just answer select, not answer voting
    #if (ra[6] == 'a_select') then
      parentpost = $parray[postid]
      #Skip if parent not found from logs
      next if parentpost == nil
      parentuser = parentpost.user
      if $uarray[puid] then
        nuser = $uarray[puid]
      else
        nuser = adduser(puid, puname)
      end
      pauid = parentuser.userid
      #Debug
      puts nuser.username + " voted on " + parentuser.username + " post id " + parentpost.postid.to_s
      # Connection edge weights
      addweight = case ra[6]
        when 'a_select' then 1
        else 0.25
      end
      if nuser.connections[pauid] == nil then nuser.connections[pauid] = addweight else nuser.connections[pauid] = nuser.connections[pauid] + addweight end
    end

    #End process log line
  end
  #End process log file
end

puts ""
puts "Begin graph export"

#JSON storage structures
jsonedgearray = Array.new

#Begin graph export
CSV.open("logexport.csv", "w") do |csv|
csv << ['source', 'target', 'weight']
  $uarray.each do |user|
    next unless user
    #Debug
    puts "Processing user " + user.username
    user.connections.each_index do |connection|
      next if user.connections[connection] == nil
      csv << [user.userid, connection, user.connections[connection]]
      #Shortcut: Adding also to JSON array (current user ID; target ID; connection weight)
      edge = {'source' => user.userid, 'target' => connection, 'weight' => user.connections[connection]}
      #Debug
      puts user.userid.to_s + " -> " + connection.to_s + " str " + user.connections[connection].to_s
    end
  end
end

#Begin CSV userlist export
CSV.open("userids.csv", "w") do |csv|
  csv << ['id', 'label']
  $uarray.each do |user|
    next unless user
    csv << [user.userid, user.username]
  end
end

#Begin JSON edge list export
File.open("logexport.json","w") do |f|
  f.write(jsonedgearray.to_json)
end