import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function ProjectComponents() {
  const { id } = useParams();
  const [components, setComponents] = useState([]);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const fetchComponents = () => {
    api.get(`/components/project/${id}`)
      .then(res => setComponents(res.data))
      .catch(() => alert("Error loading components"));
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  const handleAddComponent = async (e) => {
    e.preventDefault();

    try {
      await api.post("/components", {
        name,
        quantity,
        price,
        projectId: id
      });

      alert("Component Added");
      setName("");
      setQuantity("");
      setPrice("");

      fetchComponents();

    } catch (error) {
      alert("Error adding component");
    }
  };

  return (
    <div>
      <h2>Project Components</h2>

      <h3>Add Component</h3>
      <form onSubmit={handleAddComponent}>
        <input
          type="text"
          placeholder="Component Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button type="submit">Add</button>
      </form>

      <h3>Existing Components</h3>

      {components.map((comp) => (
        <div key={comp.id} style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
          <p><strong>Name:</strong> {comp.name}</p>
          <p><strong>Quantity:</strong> {comp.quantity}</p>
          <p><strong>Price:</strong> {comp.price}</p>
        </div>
      ))}
    </div>
  );
}

export default ProjectComponents;
