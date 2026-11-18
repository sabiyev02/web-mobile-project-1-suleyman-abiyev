
var sections = [
  { code: "vip",     name: "VIP",         price: 90, rows: ["A", "B", "C"],                seatsPerRow: 16 },
  { code: "stalls",  name: "Stalls",      price: 60, rows: ["D", "E", "F", "G", "H", "I"], seatsPerRow: 20 },
  { code: "rear",    name: "Rear Stalls", price: 40, rows: ["J", "K", "L"],                seatsPerRow: 22 },
  { code: "balcony", name: "Balcony",     price: 25, rows: ["M", "N", "O"],                seatsPerRow: 24 }
];

function isSoldSeat(rowLetter, seatNumber) {
  var rowNumber = rowLetter.charCodeAt(0); 
  return (rowNumber * 7 + seatNumber * 3) % 11 === 0;
}

var seats = {};

function createSeatData() {
  for (var i = 0; i < sections.length; i++) {
    var section = sections[i];

    for (var r = 0; r < section.rows.length; r++) {
      var rowLetter = section.rows[r];

      for (var n = 1; n <= section.seatsPerRow; n++) {
        var id = rowLetter + "-" + n;
        seats[id] = {
          id: id,
          sectionCode: section.code,
          sectionName: section.name,
          row: rowLetter,
          number: n,
          price: section.price,
          unavailable: isSoldSeat(rowLetter, n)
        };
      }
    }
  }
}


var cart = [];            
var inspectedId = null;   
var seatButtons = {};     

var STORAGE_KEY = "crescentTheatreCart";



function drawVenue() {
  var container = document.getElementById("sections");

  for (var i = 0; i < sections.length; i++) {
    var section = sections[i];

    var sectionDiv = document.createElement("div");
    sectionDiv.className = "section";

    var title = document.createElement("h3");
    title.className = "section-title";
    title.textContent = section.name + " - $" + section.price;
    sectionDiv.appendChild(title);

    for (var r = 0; r < section.rows.length; r++) {
      var rowLetter = section.rows[r];
      var rowDiv = document.createElement("div");
      rowDiv.className = "row";

      rowDiv.appendChild(createRowLabel(rowLetter));

      var half = section.seatsPerRow / 2;
      for (var n = 1; n <= section.seatsPerRow; n++) {
        rowDiv.appendChild(createSeatButton(seats[rowLetter + "-" + n]));

        if (n === half) {
          var aisle = document.createElement("span");
          aisle.className = "aisle";
          rowDiv.appendChild(aisle);
        }
      }

      rowDiv.appendChild(createRowLabel(rowLetter));
      sectionDiv.appendChild(rowDiv);
    }

    container.appendChild(sectionDiv);
  }
}

function createRowLabel(rowLetter) {
  var label = document.createElement("span");
  label.className = "row-label";
  label.textContent = rowLetter;
  return label;
}

function createSeatButton(seat) {
  var button = document.createElement("button");
  button.type = "button";
  button.textContent = seat.number;
  button.title = seat.sectionName + ", Row " + seat.row + ", Seat " + seat.number + " - $" + seat.price;
  button.setAttribute("aria-label", button.title);

  button.addEventListener("click", function () {
    inspectSeat(seat.id);
  });

  seatButtons[seat.id] = button;
  return button;
}

function drawLegend() {
  var legend = document.getElementById("legend");

  for (var i = sections.length - 1; i >= 0; i--) {
    var section = sections[i];
    var item = document.createElement("span");
    item.className = "legend-item";

    var dot = document.createElement("span");
    dot.className = "dot " + section.code;
    item.appendChild(dot);
    item.appendChild(document.createTextNode(section.name + " $" + section.price));

    legend.insertBefore(item, legend.firstChild);
  }
}


function isInCart(id) {
  return cart.indexOf(id) !== -1;
}

function updateSeatLook(id) {
  var seat = seats[id];
  var button = seatButtons[id];

  var classes = "seat " + seat.sectionCode;

  if (seat.unavailable) {
    classes += " unavailable";
  } else if (isInCart(id)) {
    classes += " in-cart";
  }

  if (id === inspectedId) {
    classes += " inspected";
  }

  button.className = classes;
}

function updateAllSeats() {
  for (var id in seats) {
    updateSeatLook(id);
  }
}


function inspectSeat(id) {
  if (wasDragged) {
    wasDragged = false;
    return;
  }

  var oldId = inspectedId;
  inspectedId = id;

  if (oldId !== null) {
    updateSeatLook(oldId);
  }
  updateSeatLook(id);

  showMessage("");
  showDetails();
}

function showDetails() {
  var emptyText = document.getElementById("detailsEmpty");
  var box = document.getElementById("detailsBox");
  var addBtn = document.getElementById("addBtn");

  if (inspectedId === null) {
    emptyText.classList.remove("hidden");
    box.classList.add("hidden");
    return;
  }

  var seat = seats[inspectedId];
  emptyText.classList.add("hidden");
  box.classList.remove("hidden");

  document.getElementById("dSection").textContent = seat.sectionName;
  document.getElementById("dRow").textContent = seat.row;
  document.getElementById("dSeat").textContent = seat.number;
  document.getElementById("dPrice").textContent = "$" + seat.price;

  var status;
  if (seat.unavailable) {
    status = "Unavailable (sold)";
    addBtn.disabled = true;
    addBtn.textContent = "NOT AVAILABLE";
  } else if (isInCart(seat.id)) {
    status = "In your cart";
    addBtn.disabled = true;
    addBtn.textContent = "ALREADY IN CART";
  } else {
    status = "Available";
    addBtn.disabled = false;
    addBtn.textContent = "ADD TO CART";
  }
  document.getElementById("dStatus").textContent = status;
}

function showMessage(text) {
  document.getElementById("message").textContent = text;
}


function addToCart() {
  if (inspectedId === null) {
    showMessage("Please click a seat first.");
    return;
  }

  var seat = seats[inspectedId];

  if (seat.unavailable) {
    showMessage("This seat is not available.");
    return;
  }

  if (isInCart(seat.id)) {
    showMessage("This seat is already in your cart.");
    return;
  }

  cart.push(seat.id);
  saveCart();
  updateSeatLook(seat.id);
  renderCart();
  showDetails();
  showMessage("");
}

function removeFromCart(id) {
  var newCart = [];
  for (var i = 0; i < cart.length; i++) {
    if (cart[i] !== id) {
      newCart.push(cart[i]);
    }
  }
  cart = newCart;

  saveCart();
  updateSeatLook(id);   
  renderCart();
  showDetails();        
}

function clearCart() {
  var oldCart = cart;
  cart = [];
  saveCart();

  for (var i = 0; i < oldCart.length; i++) {
    updateSeatLook(oldCart[i]);
  }
  renderCart();
  showDetails();
}

function renderCart() {
  var list = document.getElementById("cartList");
  var emptyText = document.getElementById("cartEmpty");
  var total = 0;

  list.innerHTML = "";

  for (var i = 0; i < cart.length; i++) {
    var seat = seats[cart[i]];
    total += seat.price;
    list.appendChild(createCartItem(seat));
  }

  if (cart.length === 0) {
    emptyText.classList.remove("hidden");
  } else {
    emptyText.classList.add("hidden");
  }

  document.getElementById("cartCount").textContent = cart.length;
  document.getElementById("cartTotal").textContent = "$" + total;
  document.getElementById("clearBtn").disabled = cart.length === 0;
}

function createCartItem(seat) {
  var item = document.createElement("li");

  var text = document.createElement("span");
  text.textContent = seat.sectionName + " · Row " + seat.row + " · Seat " + seat.number + " — $" + seat.price;

  var removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "remove-btn";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", function () {
    removeFromCart(seat.id);
  });

  item.appendChild(text);
  item.appendChild(removeBtn);
  return item;
}


function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
  }
}

function loadCart() {
  var saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    saved = null;
  }

  cart = [];
  if (!Array.isArray(saved)) {
    return;
  }

  // keep only real, available seats and no duplicates
  for (var i = 0; i < saved.length; i++) {
    var id = saved[i];
    if (seats[id] && !seats[id].unavailable && !isInCart(id)) {
      cart.push(id);
    }
  }
}


var view = { scale: 1, x: 0, y: 0 };

var MIN_SCALE = 0.3;
var MAX_SCALE = 2.5;
var ZOOM_STEP = 0.2;
var MOVE_STEP = 80;   

var viewport = document.getElementById("viewport");
var map = document.getElementById("map");

function limit(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function applyView() {
  view.scale = limit(view.scale, MIN_SCALE, MAX_SCALE);

  var maxX = (map.offsetWidth * view.scale) / 2;
  var maxY = (map.offsetHeight * view.scale) / 2;
  view.x = limit(view.x, -maxX, maxX);
  view.y = limit(view.y, -maxY, maxY);

  map.style.transform = "translate(" + view.x + "px, " + view.y + "px) scale(" + view.scale + ")";
  document.getElementById("zoomValue").textContent = Math.round(view.scale * 100) + "%";
}

function zoomIn() {
  view.scale = view.scale + ZOOM_STEP;
  applyView();
}

function zoomOut() {
  view.scale = view.scale - ZOOM_STEP;
  applyView();
}

function moveUp()    { view.y += MOVE_STEP; applyView(); }
function moveDown()  { view.y -= MOVE_STEP; applyView(); }
function moveLeft()  { view.x += MOVE_STEP; applyView(); }
function moveRight() { view.x -= MOVE_STEP; applyView(); }

function resetView() {
  var fitWidth = viewport.clientWidth / map.offsetWidth;
  var fitHeight = viewport.clientHeight / map.offsetHeight;
  var fit = Math.min(fitWidth, fitHeight, 1) * 0.95;

  view.scale = fit;
  view.x = 0;
  view.y = 0;
  applyView();
}


var isDragging = false;
var wasDragged = false;
var dragStartX = 0;
var dragStartY = 0;
var viewStartX = 0;
var viewStartY = 0;

viewport.addEventListener("wheel", function (event) {
  event.preventDefault(); 
  if (event.deltaY < 0) {
    view.scale = view.scale + 0.1;
  } else {
    view.scale = view.scale - 0.1;
  }
  applyView();
}, { passive: false });

viewport.addEventListener("mousedown", function (event) {
  if (event.button !== 0) return;
  isDragging = true;
  wasDragged = false;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  viewStartX = view.x;
  viewStartY = view.y;
});

window.addEventListener("mousemove", function (event) {
  if (!isDragging) return;

  var dx = event.clientX - dragStartX;
  var dy = event.clientY - dragStartY;

  if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
    wasDragged = true;
    viewport.classList.add("dragging");
  }

  if (wasDragged) {
    view.x = viewStartX + dx;
    view.y = viewStartY + dy;
    applyView();
  }
});

window.addEventListener("mouseup", function () {
  isDragging = false;
  viewport.classList.remove("dragging");
});

// a click that ends a drag outside a seat should not block the next seat click
viewport.addEventListener("click", function (event) {
  if (!event.target.classList.contains("seat")) {
    wasDragged = false;
  }
});



function connectButtons() {
  document.getElementById("zoomInBtn").addEventListener("click", zoomIn);
  document.getElementById("zoomOutBtn").addEventListener("click", zoomOut);
  document.getElementById("upBtn").addEventListener("click", moveUp);
  document.getElementById("downBtn").addEventListener("click", moveDown);
  document.getElementById("leftBtn").addEventListener("click", moveLeft);
  document.getElementById("rightBtn").addEventListener("click", moveRight);
  document.getElementById("resetBtn").addEventListener("click", resetView);
  document.getElementById("addBtn").addEventListener("click", addToCart);
  document.getElementById("clearBtn").addEventListener("click", clearCart);
}

function start() {
  createSeatData();
  drawVenue();
  drawLegend();
  loadCart();        
  updateAllSeats();  
  renderCart();
  showDetails();
  connectButtons();
  resetView();
}

start();
