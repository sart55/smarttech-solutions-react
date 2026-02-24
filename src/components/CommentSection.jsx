import { useState, useEffect } from "react";
import api from "../api/axios";
import PropTypes from "prop-types";

const CommentSection = ({ projectId, username }) => {
  const [comment, setComment] = useState("");
  const [commentsList, setCommentsList] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch existing comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(`/comments/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCommentsList(res.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [projectId, token]);

  const addComment = async () => {
    if (!comment.trim()) return;

    try {
      

      const commentData = {
  text: comment,
 
  username: username || "You",
};

      const res = await api.post(
        `/comments/project/${projectId}`,
        commentData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCommentsList([res.data, ...commentsList]);
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    }
  };

  return (
    <div className="card mt-4 p-3">
      <h5>Comments</h5>

      <textarea
        className="form-control mb-2"
        rows="3"
        placeholder="Add a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button className="btn btn-secondary mb-3" onClick={addComment}>
        Add Comment
      </button>

      <div
        style={{
          maxHeight: "250px",
          overflowY: "auto",
          paddingRight: "5px",
        }}
      >
        {commentsList.length === 0 ? (
          <p className="text-muted mt-2">No comments yet.</p>
        ) : (
          commentsList.map((c) => (
            <div key={c.id} className="border p-2 mt-2 rounded">
              <small className="text-muted">
                {new Date(c.createdAt).toLocaleString()}
              </small>
              <div>
                {c.text} — <strong>{c.username || "You"}</strong>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

CommentSection.propTypes = {
  projectId: PropTypes.number.isRequired,

};

export default CommentSection;
