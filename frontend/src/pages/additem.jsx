// ============================================================================
// ReWear — Add Item / Create Listing Page (src/pages/additem.jsx)
// Multi-photo selection, Cloudinary upload, and estimated swap value calculation
// ============================================================================
import API_BASE_URL from "../api";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function AddItem() {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [formData, setFormData] = useState({
    name: "Denim Jacket",
    brand: "Levi's",
    category: "Jacket",
    size: "M",
    condition: "Like new",
    location: user?.location || "Ahmedabad, Gujarat",
    originalPrice: "3500",
    color: "Blue",
    description:
      "Classic denim jacket in excellent condition with minimal wear. Looking to swap for a warm winter coat or knitwear.",
  });

  const [swapValue, setSwapValue] = useState(1200);
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [previewUrls, setPreviewUrls] = useState([]);
  const previewUrlsRef = useRef([]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [previewUrls]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
    e.target.value = "";
  };

  const processFiles = (selectedFiles) => {
    const remainingSlots = 5 - images.length;
    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    const validImages = selectedFiles.filter(
      (file) => validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024,
    );

    if (validImages.length !== selectedFiles.length) {
      alert("Choose JPG, PNG, or WebP images up to 5 MB each.");
    }

    const filesToAdd = validImages.slice(0, remainingSlots);

    if (validImages.length > remainingSlots) {
      alert("You can select a maximum of 5 photos.");
    }

    const newPreviews = filesToAdd.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    previewUrlsRef.current.push(...newPreviews.map((p) => p.url));

    setImages((prev) => [...prev, ...filesToAdd]);
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));

    setPreviewUrls((prev) => {
      const removed = prev[indexToRemove];
      if (removed) {
        URL.revokeObjectURL(removed.url);
        previewUrlsRef.current = previewUrlsRef.current.filter(
          (url) => url !== removed.url,
        );
      }
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const calculateSwapValue = () => {
    const price = Number(formData.originalPrice);

    if (!Number.isFinite(price) || price <= 0) {
      alert("Please enter a valid original price");
      return;
    }

    let percentage = 0.35;
    if (formData.condition === "Like new") {
      percentage = 0.55;
    } else if (formData.condition === "Good") {
      percentage = 0.4;
    } else if (formData.condition === "Fair") {
      percentage = 0.25;
    }

    setSwapValue(Math.round(price * percentage));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!token) {
      alert("Please log in before publishing a listing.");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedUrls = [];

      // Upload each selected photo to Cloudinary
      for (const file of images) {
        const imageFormData = new FormData();
        imageFormData.append("image", file);

        const uploadResponse = await fetch(
          `${API_BASE_URL}/items/upload-image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: imageFormData,
          },
        );

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.message || "An image failed to upload.");
        }

        uploadedUrls.push(uploadData.imageUrl);
      }

      // Create listing containing every uploaded image URL
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.name,
          brand: formData.brand,
          description: formData.description,
          category: formData.category,
          size: formData.size,
          condition: formData.condition,
          location: formData.location,
          estimatedValue: swapValue,
          image: uploadedUrls[0] || "",
          images: uploadedUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create listing.");
      }

      alert("Listing published successfully!");
      navigate("/browse");
    } catch (error) {
      console.error("Failed to publish listing:", error);
      alert(error.message || "Something went wrong while publishing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page-container">
      <div style={{ marginBottom: "20px" }}>
        <Link
          to="/browse"
          className="muted"
          style={{ fontSize: "13px", fontWeight: 650 }}
        >
          ← Back to Explore
        </Link>
      </div>

      <div className="form">
        <div className="eyebrow">CREATE A LISTING</div>
        <h1 style={{ fontSize: "36px", marginBottom: "8px" }}>
          Give your piece a new life.
        </h1>
        <p className="muted" style={{ maxWidth: "600px" }}>
          Share genuine photos and accurate details so community members can
          propose honest, fair value swaps.
        </p>

        {/* Polished Drag & Drop Photo Area */}
        <div
          className="upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            borderColor: isDragging ? "var(--sage)" : undefined,
            backgroundColor: isDragging ? "var(--sage2-soft)" : undefined,
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={handleImageChange}
          />

          <div
            style={{
              fontSize: "32px",
              color: "var(--sage)",
              marginBottom: "6px",
            }}
          >
            📸
          </div>

          <h3 style={{ fontSize: "17px", margin: "0 0 6px" }}>
            Drag and drop clothing photos here
          </h3>

          <p
            className="muted"
            style={{ fontSize: "12.5px", margin: "0 0 4px" }}
          >
            Add front, back, label, and texture close-ups · JPG / PNG / WebP
          </p>

          <p className="muted" style={{ fontSize: "12px", margin: 0 }}>
            <strong>{images.length} of 5</strong> photos selected · Up to 5 MB
            per photo
          </p>

          <button
            type="button"
            className="btn light"
            style={{ marginTop: "16px", padding: "10px 20px" }}
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= 5}
          >
            {images.length >= 5
              ? "Photo Limit Reached (5/5)"
              : "Choose photos from device"}
          </button>

          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                justifyContent: "center",
                marginTop: "24px",
                paddingTop: "20px",
                borderTop: "1px dashed var(--line)",
              }}
            >
              {previewUrls.map(({ file, url }, index) => (
                <div
                  key={`${file.name}-${file.lastModified}-${index}`}
                  style={{
                    width: "120px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    position: "relative",
                  }}
                >
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "var(--r-md)",
                      border: "1px solid var(--line)",
                      boxShadow: "var(--shadow-xs)",
                    }}
                  />
                  <button
                    type="button"
                    className="btn light"
                    style={{
                      padding: "4px 8px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--rose)",
                      borderColor: "var(--rose-border)",
                    }}
                    onClick={() => handleRemoveImage(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Listing Details Form */}
        <form onSubmit={handleSubmit}>
          <div className="formGrid">
            <div className="field">
              <label htmlFor="item-name">ITEM TITLE</label>
              <input
                id="item-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Classic Denim Jacket"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="item-brand">BRAND</label>
              <input
                id="item-brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Levi's, Zara, Vintage"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="item-category">CATEGORY</label>
              <select
                id="item-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option>Jacket</option>
                <option>Dress</option>
                <option>Top</option>
                <option>Shoes</option>
                <option>Bag</option>
                <option>Hoodie</option>
                <option>Pants</option>
                <option>Shirt</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="item-size">SIZE</label>
              <select
                id="item-size"
                name="size"
                value={formData.size}
                onChange={handleChange}
              >
                <option>XS</option>
                <option>S</option>
                <option>M</option>
                <option>L</option>
                <option>XL</option>
                <option>One size</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="item-condition">CONDITION</label>
              <select
                id="item-condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
              >
                <option>Like new</option>
                <option>Good</option>
                <option>Fair</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="item-location">LOCATION</label>
              <input
                id="item-location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Ahmedabad, Gujarat"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="original-price">ORIGINAL RETAIL PRICE (₹)</label>
              <input
                id="original-price"
                type="number"
                min="1"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="e.g. 3500"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="item-color">PRIMARY COLOR</label>
              <input
                id="item-color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="e.g. Blue, Beige, Olive"
              />
            </div>

            <div className="field full">
              <label htmlFor="item-description">
                DESCRIPTION & SWAP PREFERENCES
              </label>
              <textarea
                id="item-description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe fit, fabric composition, imperfections, and what you might like in return…"
                required
              />
            </div>
          </div>

          {/* Prominent Estimated Swap Value Box */}
          <div className="valueBox">
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "var(--sage)",
                }}
              >
                Suggested Swap Value
              </div>

              <div className="bigPrice" style={{ margin: "4px 0" }}>
                ₹{swapValue.toLocaleString("en-IN")}
              </div>

              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                Calculated based on original price and{" "}
                {formData.condition.toLowerCase()} condition. Zero money changes
                hands.
              </div>
            </div>

            <button
              type="button"
              className="btn light"
              onClick={calculateSwapValue}
              style={{ flexShrink: 0 }}
            >
              ↻ Recalculate
            </button>
          </div>

          {/* Form Actions */}
          <div className="formFoot">
            <button
              type="button"
              className="btn light"
              onClick={() => navigate("/browse")}
            >
              Save Draft
            </button>

            <button
              type="submit"
              className="btn dark"
              disabled={isSubmitting}
              style={{ minWidth: "160px" }}
            >
              {isSubmitting ? "Publishing Piece…" : "Publish Listing →"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AddItem;
