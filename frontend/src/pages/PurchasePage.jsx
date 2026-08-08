import { useEffect, useState } from "react";
import axios from "axios";
import RestaurantLayout from "../layouts/RestaurantLayout";
import "./DashboardPage.css";
import "./PurchasePage.css";

function PurchasePage() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [recipeItems, setRecipeItems] = useState([]);

  const [showAddItem, setShowAddItem] = useState(false);
  const [loading, setLoading] = useState(false);

  const [vendorName, setVendorName] = useState("");
  const [handledBy, setHandledBy] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [gstPercent, setGstPercent] = useState(5);

  const [purchaseRows, setPurchaseRows] = useState([
    {
      inventory_item: "",
      quantity: "",
      unit_price: "",
    },
  ]);

  const [newItem, setNewItem] = useState({
    name: "",
    unit: "Kg",
    quantity: 0,
    low_limit: 5,
    unit_price: 0,
  });

  const [recipeForm, setRecipeForm] = useState({
    menu_item: "",
    inventory_item: "",
    quantity_required: "",
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [inventoryRes, menuRes, recipeRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/inventory/items/"),
        axios.get("http://127.0.0.1:8000/api/restaurant/menu-items/"),
        axios.get("http://127.0.0.1:8000/api/inventory/recipe-items/"),
      ]);

      setInventoryItems(inventoryRes.data);
      setMenuItems(menuRes.data);
      setRecipeItems(recipeRes.data);
    } catch (error) {
      console.log("Fetch purchase data error", error);
      alert("Failed to load purchase data");
    }
  };

  const getBackendErrorMessage = (error) => {
    const data = error.response?.data;

    if (!data) return "Something went wrong";
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;

    const messages = [];

    Object.keys(data).forEach((key) => {
      const value = data[key];

      if (Array.isArray(value)) {
        messages.push(`${key}: ${value[0]}`);
      } else {
        messages.push(`${key}: ${value}`);
      }
    });

    return messages.length > 0 ? messages.join("\n") : JSON.stringify(data);
  };

  const getItemName = (itemId) => {
    const item = inventoryItems.find((i) => Number(i.id) === Number(itemId));
    return item ? item.name : `Item ${itemId}`;
  };

  const getMenuName = (menuId) => {
    const item = menuItems.find((m) => Number(m.id) === Number(menuId));
    return item ? item.name : `Menu ${menuId}`;
  };

  const getItemStock = (item) => {
    return (
      item.quantity ??
      item.stock ??
      item.current_stock ??
      item.available_stock ??
      0
    );
  };

  const getItemUnit = (item) => {
    return item.unit || item.unit_name || "Unit";
  };

  const getRecipeMenuId = (recipe) => {
    if (typeof recipe.menu_item === "object") {
      return recipe.menu_item.id;
    }

    return recipe.menu_item || recipe.menu_item_id;
  };

  const getRecipeInventoryId = (recipe) => {
    if (typeof recipe.inventory_item === "object") {
      return recipe.inventory_item.id;
    }

    return recipe.inventory_item || recipe.inventory_item_id;
  };

  const getRecipeQuantity = (recipe) => {
    return (
      recipe.quantity_used ??
      recipe.quantity_required ??
      recipe.required_quantity ??
      recipe.quantity ??
      0
    );
  };

  // -----------------------------
  // Add new grocery / inventory item
  // -----------------------------

  const handleNewItemChange = (e) => {
    setNewItem({
      ...newItem,
      [e.target.name]: e.target.value,
    });
  };

  const addInventoryItem = async (e) => {
    e.preventDefault();

    if (!newItem.name.trim()) {
      alert("Please enter item name");
      return;
    }

    if (Number(newItem.low_limit) < 0) {
      alert("Low limit cannot be negative");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: newItem.name,
        unit: newItem.unit,
        quantity: Number(newItem.quantity || 0),
        low_limit: Number(newItem.low_limit || 0),
        unit_price: Number(newItem.unit_price || 0),
      };

      await axios.post("http://127.0.0.1:8000/api/inventory/items/", payload);

      alert("Inventory item added successfully");

      setNewItem({
        name: "",
        unit: "Kg",
        quantity: 0,
        low_limit: 5,
        unit_price: 0,
      });

      setShowAddItem(false);
      fetchAllData();
    } catch (error) {
      console.log("Add inventory item error", error);
      alert(getBackendErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Purchase / Restock
  // -----------------------------

  const addPurchaseRow = () => {
    setPurchaseRows([
      ...purchaseRows,
      {
        inventory_item: "",
        quantity: "",
        unit_price: "",
      },
    ]);
  };

  const removePurchaseRow = (index) => {
    if (purchaseRows.length === 1) {
      alert("At least one row is required");
      return;
    }

    const updatedRows = purchaseRows.filter((_, i) => i !== index);
    setPurchaseRows(updatedRows);
  };

  const updatePurchaseRow = (index, field, value) => {
    const updatedRows = [...purchaseRows];

    updatedRows[index] = {
      ...updatedRows[index],
      [field]: value,
    };

    setPurchaseRows(updatedRows);
  };

  const rowTotal = (row) => {
    return Number(row.quantity || 0) * Number(row.unit_price || 0);
  };

  const subtotal = purchaseRows.reduce((sum, row) => sum + rowTotal(row), 0);
  const gstAmount = (subtotal * Number(gstPercent || 0)) / 100;
  const grandTotal = subtotal + gstAmount;

  const savePurchase = async () => {
    if (!vendorName.trim()) {
      alert("Please enter vendor name");
      return;
    }

    const validRows = purchaseRows.filter(
      (row) =>
        row.inventory_item &&
        Number(row.quantity) > 0 &&
        Number(row.unit_price) >= 0
    );

    if (validRows.length === 0) {
      alert("Please add at least one valid purchase item");
      return;
    }

    try {
      setLoading(true);

      for (const row of validRows) {
        await axios.post("http://127.0.0.1:8000/api/purchase/restock/", {
          inventory_item: Number(row.inventory_item),
          quantity: Number(row.quantity),
          unit_price: Number(row.unit_price),
          vendor_name: vendorName,
          handled_by: handledBy || "-",
          purchase_date: purchaseDate,
          gst_percent: Number(gstPercent || 0),
        });
      }

      alert("Purchase saved and inventory updated successfully");

      setPurchaseRows([
        {
          inventory_item: "",
          quantity: "",
          unit_price: "",
        },
      ]);

      setVendorName("");
      setHandledBy("");
      setGstPercent(5);

      fetchAllData();
    } catch (error) {
      console.log("Save purchase error", error);
      alert(getBackendErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Recipe Setup
  // -----------------------------

  const handleRecipeChange = (e) => {
    setRecipeForm({
      ...recipeForm,
      [e.target.name]: e.target.value,
    });
  };

  const saveRecipeItem = async (e) => {
    e.preventDefault();

    if (!recipeForm.menu_item) {
      alert("Please select menu item");
      return;
    }

    if (!recipeForm.inventory_item) {
      alert("Please select inventory item");
      return;
    }

    if (
      !recipeForm.quantity_required ||
      Number(recipeForm.quantity_required) <= 0
    ) {
      alert("Quantity required must be greater than 0");
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://127.0.0.1:8000/api/inventory/recipe-items/", {
        menu_item: Number(recipeForm.menu_item),
        inventory_item: Number(recipeForm.inventory_item),
        quantity_used: Number(recipeForm.quantity_required),
      });

      alert("Recipe ingredient added successfully");

      setRecipeForm({
        menu_item: "",
        inventory_item: "",
        quantity_required: "",
      });

      fetchAllData();
    } catch (error) {
      console.log("Save recipe error", error);
      alert(getBackendErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipeItem = async (recipeId) => {
    if (!window.confirm("Delete this recipe ingredient?")) {
      return;
    }

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/inventory/recipe-items/${recipeId}/`
      );

      alert("Recipe ingredient deleted successfully");
      fetchAllData();
    } catch (error) {
      console.log("Delete recipe error", error);
      alert(getBackendErrorMessage(error));
    }
  };

  return (
    <RestaurantLayout>
      <div className="page-box purchase-page-box">
        <div className="page-header">
          <div>
            <h1>Purchase & Recipe Management</h1>
            <p>
              Add grocery items, restock inventory, and connect ingredients with
              menu recipes.
            </p>
          </div>

          <button
            className="add-btn"
            type="button"
            onClick={() => setShowAddItem(!showAddItem)}
          >
            {showAddItem ? "Close" : "+ Add Grocery Item"}
          </button>
        </div>

        {showAddItem && (
          <form className="purchase-section" onSubmit={addInventoryItem}>
            <h2>Add New Grocery / Inventory Item</h2>

            <div className="purchase-grid">
              <div className="purchase-field">
                <label>Item Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Example: Rice Batter"
                  value={newItem.name}
                  onChange={handleNewItemChange}
                />
              </div>

              <div className="purchase-field">
                <label>Unit</label>
                <select
                  name="unit"
                  value={newItem.unit}
                  onChange={handleNewItemChange}
                >
                  <option value="Kg">Kg</option>
                  <option value="Gram">Gram</option>
                  <option value="Litre">Litre</option>
                  <option value="ML">ML</option>
                  <option value="Pcs">Pcs</option>
                  <option value="Packet">Packet</option>
                </select>
              </div>

              <div className="purchase-field">
                <label>Opening Stock</label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="0"
                  value={newItem.quantity}
                  onChange={handleNewItemChange}
                />
              </div>

              <div className="purchase-field">
                <label>Low Stock Limit</label>
                <input
                  type="number"
                  name="low_limit"
                  placeholder="5"
                  value={newItem.low_limit}
                  onChange={handleNewItemChange}
                />
              </div>

              <div className="purchase-field">
                <label>Unit Price</label>
                <input
                  type="number"
                  name="unit_price"
                  placeholder="0"
                  value={newItem.unit_price}
                  onChange={handleNewItemChange}
                />
              </div>

              <div className="purchase-field button-field">
                <button className="save-purchase-btn" disabled={loading}>
                  {loading ? "Saving..." : "Save Item"}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="purchase-section">
          <h2>Purchase / Restock Grocery Items</h2>

          <div className="purchase-grid">
            <div className="purchase-field">
              <label>Vendor Name</label>
              <input
                type="text"
                placeholder="Example: ABC Traders"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
              />
            </div>

            <div className="purchase-field">
              <label>Handled By</label>
              <input
                type="text"
                placeholder="Employee name"
                value={handledBy}
                onChange={(e) => setHandledBy(e.target.value)}
              />
            </div>

            <div className="purchase-field">
              <label>Purchase Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>

            <div className="purchase-field">
              <label>GST %</label>
              <select
                value={gstPercent}
                onChange={(e) => setGstPercent(e.target.value)}
              >
                <option value="0">GST 0%</option>
                <option value="5">GST 5%</option>
                <option value="12">GST 12%</option>
                <option value="18">GST 18%</option>
              </select>
            </div>
          </div>

          <div className="purchase-table-wrapper">
            <table className="premium-table purchase-table">
              <thead>
                <tr>
                  <th>Inventory Item</th>
                  <th>Current Stock</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {purchaseRows.map((row, index) => {
                  const selectedItem = inventoryItems.find(
                    (item) => Number(item.id) === Number(row.inventory_item)
                  );

                  return (
                    <tr key={index}>
                      <td>
                        <select
                          value={row.inventory_item}
                          onChange={(e) =>
                            updatePurchaseRow(
                              index,
                              "inventory_item",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select Item</option>

                          {inventoryItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        {selectedItem
                          ? `${getItemStock(selectedItem)} ${getItemUnit(
                              selectedItem
                            )}`
                          : "-"}
                      </td>

                      <td>
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={row.quantity}
                          onChange={(e) =>
                            updatePurchaseRow(index, "quantity", e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          min="0"
                          placeholder="Price"
                          value={row.unit_price}
                          onChange={(e) =>
                            updatePurchaseRow(
                              index,
                              "unit_price",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>₹{rowTotal(row).toFixed(2)}</td>

                      <td>
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => removePurchaseRow(index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="purchase-actions">
            <button type="button" className="edit-btn" onClick={addPurchaseRow}>
              + Add Row
            </button>
          </div>

          <div className="purchase-summary">
            <p>
              Vendor: <strong>{vendorName || "-"}</strong>
            </p>

            <p>
              Handled By: <strong>{handledBy || "-"}</strong>
            </p>

            <p>
              Subtotal: <strong>₹{subtotal.toFixed(2)}</strong>
            </p>

            <p>
              GST: <strong>₹{gstAmount.toFixed(2)}</strong>
            </p>

            <h2>Grand Total: ₹{grandTotal.toFixed(2)}</h2>

            <button
              type="button"
              className="save-purchase-btn"
              onClick={savePurchase}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Purchase"}
            </button>
          </div>
        </div>

        <div className="purchase-section">
          <h2>Recipe Setup</h2>

          <p className="section-help">
            Connect menu items with grocery ingredients. Example: Idli → Rice
            Batter → 1 Kg.
          </p>

          <form className="purchase-grid" onSubmit={saveRecipeItem}>
            <div className="purchase-field">
              <label>Menu Item</label>
              <select
                name="menu_item"
                value={recipeForm.menu_item}
                onChange={handleRecipeChange}
              >
                <option value="">Select Menu Item</option>

                {menuItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="purchase-field">
              <label>Ingredient / Grocery Item</label>
              <select
                name="inventory_item"
                value={recipeForm.inventory_item}
                onChange={handleRecipeChange}
              >
                <option value="">Select Ingredient</option>

                {inventoryItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({getItemStock(item)} {getItemUnit(item)})
                  </option>
                ))}
              </select>
            </div>

            <div className="purchase-field">
              <label>Quantity Used</label>
              <input
                type="number"
                step="0.01"
                name="quantity_required"
                placeholder="Example: 1"
                value={recipeForm.quantity_required}
                onChange={handleRecipeChange}
              />
            </div>

            <div className="purchase-field button-field">
              <button className="save-purchase-btn" disabled={loading}>
                {loading ? "Saving..." : "+ Add Recipe"}
              </button>
            </div>
          </form>

          <div className="purchase-table-wrapper">
            <table className="premium-table purchase-table">
              <thead>
                <tr>
                  
                  <th>Menu Item</th>
                  <th>Ingredient</th>
                  <th>Quantity Used</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {recipeItems.length === 0 ? (
                  <tr>
                    <td colSpan="5">No recipe ingredients added yet.</td>
                  </tr>
                ) : (
                  recipeItems.map((recipe) => {
                    const menuId = getRecipeMenuId(recipe);
                    const inventoryId = getRecipeInventoryId(recipe);

                    return (
                      <tr key={recipe.id}>
                        <td>{getMenuName(menuId)}</td>
                        <td>{getItemName(inventoryId)}</td>
                        <td>{getRecipeQuantity(recipe)}</td>
                        <td>
                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() => deleteRecipeItem(recipe.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RestaurantLayout>
  );
}

export default PurchasePage;