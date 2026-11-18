# Crescent Theatre – Interactive Venue Ticketing

A front-end ticket-selection website for a theatre, built with plain HTML, CSS and JavaScript.

## How to run
Open `index.html` in a browser. No installation needed.

## Venue
| Section     | Rows  | Seats per row | Price |
|-------------|-------|---------------|-------|
| VIP         | A–C   | 16            | $90   |
| Stalls      | D–I   | 20            | $60   |
| Rear Stalls | J–L   | 22            | $40   |
| Balcony     | M–O   | 24            | $25   |

306 seats in total, all generated from the `sections` array in `script.js`.
Some seats are marked as sold using a simple fixed rule, so they stay the same after refresh.

## Features
- Click a seat to **inspect** it (section, row, seat, price, status). The cart does not change.
- **ADD TO CART** adds the inspected seat. The same seat cannot be added twice.
- Sold seats can be inspected but not added.
- Seat states: available, inspected (black outline), in cart (dark blue), unavailable (grey).
- Cart shows each ticket, its price and the total. Tickets can be removed, and the seat on the map updates at once.
- Cart is saved in `localStorage` and restored after a page refresh, together with the seat colors.
- Map controls: Zoom In, Zoom Out, Up, Down, Left, Right, Reset View (with limits).
- Bonus: mouse-wheel zoom and click-and-drag panning.
- Responsive layout for desktop, tablet and phone.

## Files
- `index.html` – page structure
- `style.css` – layout, colors, seat states, responsive rules
- `script.js` – venue data, seat drawing, inspection, cart, storage, navigation
