import math

from flask import Flask, render_template, request, jsonify
import yt_dlp
from yt_dlp.utils import DownloadError
import os
from datetime import datetime

app = Flask(__name__)


@app.route('/qualities', methods=["POST"])
def get_qualities():
    try:
        data = request.get_json()

        if not data or "url" not in data:
            return jsonify({
                "success": False,
                "videoMessage": "Please provide a YouTube URL."
            }), 400
        url = data["url"].strip()

        if not url:
            return jsonify({
                "success": False,
                "videoMessage": "URL cannot be empty."
            }), 400

        yt_opts = {
            'quiet': True,
            'noplaylist': True
        }

        with yt_dlp.YoutubeDL(yt_opts) as yt:
            info = yt.extract_info(url, download=False)

        qualities = []

        for f in info["formats"]:
            if f.get("ext") == "mp4" and f.get("vcodec") != "none":
                if not any(q.get("height") == f.get("height") for q in qualities):
                    qualities.append({
                        "format_id": f["format_id"],
                        "height": f.get("height"),
                        "ext": f["ext"],
                        "hasAudio": f.get("acodec") != "none"
                    })

        return jsonify({
            "success": True,
            "title": info["title"],
            "thumbnail": info["thumbnail"],
            "qualities": qualities,
            'info': info
        })

    except DownloadError as e:
        error = str(e)

        if "Video unavailable" in error:
            message = "This video is unavailable."
        elif "Private video" in error:
            message = "This video is private."
        elif "Unsupported URL" in error:
            message = "Please enter a valid YouTube URL."
        elif "Sign in to confirm your age" in error:
            message = "This video is age restricted."
        elif "sign in" in error:
            message = "This video is restricted and cannot be downloaded."
        else:
            message = "Please enter a valid URL"

        return jsonify({
            "success": False,
            "videoMessage": message
        }), 400

    except Exception as e:
        print(e)

        return jsonify({
            "success": False,
            "videoMessage": "Something went wrong while getting the video information."
        }), 500


@app.route('/download', methods=["POST"])
def download_video(output_path='savenow-downloads'):
    try:
        os.makedirs(output_path, exist_ok=True)
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "videoMessage": "No data received."
            }), 400

        video_format = data["selectedFormat"]
        url = data["url"]
        has_audio = data["hasAudio"]

        if has_audio:
            format_string = video_format
        else:
            format_string = f"{video_format}+bestaudio"

        ydl_opts = {
            'format': format_string,
            'outtmpl': f'{output_path}/%(title)s-%(height)sp.%(ext)s',
            "merge_output_format": "mp4",
            'quiet': False,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        return jsonify({
            "success": True,
            "videoMessage": "Download completed successfully."
        })

    except DownloadError as e:
        error = str(e)

        if "Requested format is not available" in error:
            message = "The selected quality is no longer available."
        elif "Video unavailable" in error:
            message = "This video is unavailable."
        else:
            message = error

        return jsonify({
            "success": False,
            "videoMessage": message
        }), 400

    except Exception as e:
        print(e)
        return jsonify({
            "success": False,
            "videoMessage": "Download failed."
        }), 500