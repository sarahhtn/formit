$(document).ready(function(){
	sidebar.init();
	dance.init();
	if(dance.atBeginning()) $('#previous').addClass('disabled');
	if(dance.atEnd()) $('#next').removeClass('btn-primary').addClass('btn-success')
		.find('i').removeClass('icon-forward').addClass('icon-plus');
	$('#delete').on('click', function(){
		dance.removeSelected();
	});
	$('#previous').on('click', function(){
		dance.previousFormation();
		dance.deselectAll();
		if(dance.atBeginning()) $(this).addClass('disabled');
		$('#next').addClass('btn-primary').removeClass('btn-success')
			.find('i').removeClass('icon-plus').addClass('icon-forward');
		$('#formation_number').html(dance.f_id + 1)
	});
	$('#next').on('click', function(){
		dance.nextFormation();
		dance.deselectAll();
		$('#previous').removeClass('disabled');
		if(dance.atEnd()) $('#next').removeClass('btn-primary').addClass('btn-success')
			.find('i').removeClass('icon-forward').addClass('icon-plus');
		$('#formation_number').html(dance.f_id + 1)
	})
});