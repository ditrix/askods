<div class="media_results">
    <div class="media_result_label"> РЕЗУЛЬТАТ: </div>
    <div id="media-result-id" class="media_result_value"></div>
</div>
<?php echo \Core\Widgets::get('SubMenu', ['prefix' => $current->alias . '/', 'result' => $menu]); ?>
<div class="wBlock_content">
    <div class="wSize padding_in">
        <div class="wBlock_service">
            <div class="wTitle w_tal">
                <h1><?php echo $h1 ?: $obj->name; ?></h1>
            </div>
            <?php if($obj->buy_show_banner OR ($obj->buy_show_files && count($files))): ?>
                <div class="wBlock_service_right">
                    <?php echo $obj->buy_show_banner ? \Core\Widgets::get('Banner') : null; ?>
                    <?php if($obj->buy_show_files && count($files)): ?>
                        <?php echo \Core\View::tpl(['files' => $files, 'directory' => $directory], 'BuyInsurance/Files'); ?>
                    <?php endif; ?>
					<?php if( in_array( $obj->id, [159,160, 161]) ):  ?>
					<div class="pay_result_wrapper">
						<p>
						<?php echo __('Вы можете самостоятельно рассчитать стоимость полиса Автогражданки заполнив поля формы.');?>
						</p>
	
						
						<div class="pay_result">
							<div class="result_label"> РЕЗУЛЬТАТ: </div>
							<br>
							<div  id='pay_result_id' >
								<!-- результат расчета -->		
							</div>
						</div><!-- eof pay_result -->
					</div><!-- eof pay_result_wrapper -->
					
					
					<?php endif; ?>
					
                </div>
           
           <?php endif; ?>
      

            <div class="<?php echo ($obj->buy_show_banner OR ($obj->show_files && count($files))) ? 'wBlock_service_center' : null; ?>">
                
				<div class="wBlock_service_content wTxt  calculator_by_text">
        
                    <?php echo $obj->buy_text; ?>
.
         
                </div>
                <?php echo \Core\Widgets::get('BuyInsuranceForm', ['item' => $obj]); ?>
				
            </div>
        </div>
    </div>
</div>
