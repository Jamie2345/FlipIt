function toggleSubValues(button) {
  console.log('sub values')
  var row = button.parentNode.parentNode;
  var subValuesRow = row.nextElementSibling;

  if (subValuesRow && subValuesRow.classList.contains('sub-values')) {
    subValuesRow.style.display = subValuesRow.style.display === 'none' ? 'table-row' : 'none';
  } else {
    var subValues = document.createElement('tr');
    subValues.classList.add('sub-values');
    subValues.innerHTML = '<td colspan="4">Sub-value 1: 5 | Sub-value 2: 8 | Sub-value 3: 12</td>';
    row.parentNode.insertBefore(subValues, row.nextSibling);
  }
}
