/*
<license>
Get opened tabs URLs - a Google Chrome extension
Copyright 2010 Christophe Benz.

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
</license>

Icon from Silk icon set:
http://www.famfamfam.com/lab/icons/silk/
*/

$('ul').on('click', 'li', function() {
    // alert( $(this).attr('id'));
    console.log("moving to..................." );
    // chrome.tabs.get($(this).attr('id'));
    chrome.tabs.update(parseInt($(this).attr('id')), {active: true, selected: true, highlighted: true});
    chrome.tabs.captureVisibleTab(function(dataUrl) {
      var image = new Image();
      image.src = dataUrl;
      image.height = 100;
      image.width = 100;
      document.body.appendChild(image);
      console.log(dataUrl);
    });
});

function list(tabs) {
  for (var i = 0; i < tabs.length; i++) {
    $("#url-list").append('<li id="' + tabs[i].id + '"><a href="' + tabs[i].url + '"><span id="img' + tabs[i].id + '">' + tabs[i].title + '</span></a></li>');
  }
}

document.getElementById('copy').addEventListener('click', function(e) {
  chrome.tabs.getAllInWindow(null, list);
});
