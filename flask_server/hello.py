from flask import Flask, url_for, request
from markupsafe import escape

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route('/user/<username>')
def show_user_profile(username):
    # show the user profile for that user
    return escape(f'User {username}')

@app.route('/post/<int:post_id>')
def show_post(post_id):
    # show the post with the given id, the id is an integer
    return escape(f'Post {post_id} integer')

@app.route('/post/<string:post_id>', methods=["GET", "POST"])
def show_post_str(post_id):
    # show the post with the given id, the id is an integer
    # if request.method == 'POST':
    #     return escape(f'Post {post_id} string')
    # else:
    #     return escape(f'Post {post_id} string')
    match request.method:
        case 'GET':
            return escape(f'Post {post_id} string')
        case 'POST':
            return escape(f'Post {post_id} string')

@app.route('/path/<path:subpath>')
def show_subpath(subpath):
    # show the subpath after /path/
    return escape(f'Subpath {subpath}')

@app.route('/projects/')
def projects():
    return 'The project page'

@app.route('/about/')
def about():
    text = f"""<div>The about page</div>
    <div>{url_for('hello_world')}</div>
    <div>{url_for('show_post_str', post_id='fd2asdf')}</div>"""
    return text

if __name__ == "__main__":
    app.run(debug=True, port=8080)