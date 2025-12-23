from flask import Flask, jsonify, request
from flask_cors import CORS
from ytmusicapi import YTMusic

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route("/flask/search", methods=["GET"])
def search():
    query = request.args.get("query")
    if not query:
        return jsonify({"error": "Query is required"}), 400
    yt = YTMusic()
    
    # Append "karaoke" to search query to favour karaoke results
    karaoke_query = f"{query} karaoke"
    results = yt.search(karaoke_query, filter="videos")

    # Sort results to prioritize karaoke versions, then official videos, UGC last
    def sort_key(x):
        title_lower = x.get("title", "").lower()
        is_karaoke = "karaoke" in title_lower or "instrumental" in title_lower
        is_ugc = "UGC" in x.get("videoType", "")
        # Lower values come first: karaoke (0) > official (1) > UGC (2)
        return (0 if is_karaoke else 1, 1 if is_ugc else 0)
    
    results = sorted(results, key=sort_key)

    # Limit to 5 results
    results = results[:5]
    # Loop over results to filter out songs that aren't embeddable
    # TODO is there a better way to do this? 
    # Maybe streaming the results back?
    # In my rudimentary test a request took 1.17s without the filter, while it took 2.93s with filtering enabled.
    # But on the other hand, we kind of *need* to check this, because otherwise we'll get songs that are not embeddable and will fail in the last second.
    #results = [result for result in results if yt.get_song(result["videoId"])["playabilityStatus"].get("playableInEmbed", False)]
    return jsonify(results)

@app.route("/flask/get-mood-categories", methods=["GET"])
def get_mood_categories():
    yt = YTMusic()
    mood_categories = yt.get_mood_categories()
    
    # Only show the "Moods & moments" category
    mood_categories = mood_categories["Moods & moments"]

    response = jsonify(mood_categories)
    response.cache_control.max_age = 60 * 60 * 24 # 24 hours
    return response

@app.route("/flask/get-mood-playlists", methods=["GET"])
def get_mood_playlists():
    mood_category = request.args.get("mood_category")
    if not mood_category:
        return jsonify({"error": "Mood category is required"}), 400
    yt = YTMusic()
    playlists = yt.get_mood_playlists(mood_category)

    # Limit to 15 results
    playlists = playlists[:15]
    response = jsonify(playlists)
    response.cache_control.max_age = 60 * 60 * 24 # 24 hours
    return response

@app.route("/flask/get-playlist", methods=["GET"])
def get_playlist():
    playlistId = request.args.get("playlistId")
    if not playlistId:
        return jsonify({"error": "Playlist ID is required"}), 400
    yt = YTMusic()
    playlist = yt.get_playlist(playlistId)

    if playlist is None:
        return jsonify({"error": "Playlist not found"}), 404
    return jsonify(playlist)