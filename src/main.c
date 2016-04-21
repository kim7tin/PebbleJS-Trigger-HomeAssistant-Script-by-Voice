/**
 *  Pebble.js Project main file.
 */

#include <pebble.h>
#include "simply/simply.h"

static Window *s_main_window;
static GBitmap *s_bitmap;
static BitmapLayer *s_bitmap_layer;

Simply *simply;

/**
 * By default, we 'simply' load Simply and start running it.
 */

static void window_load(Window *window) {
	Layer *window_layer = window_get_root_layer(window);
	GRect bounds = layer_get_bounds(window_layer);

	s_bitmap = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_STARTUP_BG_COLOR);

	s_bitmap_layer = bitmap_layer_create(bounds);
	bitmap_layer_set_bitmap(s_bitmap_layer, s_bitmap);
#ifdef PBL_PLATFORM_APLITE
	bitmap_layer_set_compositing_mode(s_bitmap_layer, GCompOpAssign);
#elif PBL_PLATFORM_BASALT
	bitmap_layer_set_compositing_mode(s_bitmap_layer, GCompOpSet);
#endif
	layer_add_child(window_layer, bitmap_layer_get_layer(s_bitmap_layer));
}

static void window_unload(Window *window) {
	bitmap_layer_destroy(s_bitmap_layer);
	gbitmap_destroy(s_bitmap);
}

static void init() {
	s_main_window = window_create();
	window_set_window_handlers(s_main_window, (WindowHandlers ) { .load =
					window_load, .unload = window_unload, });
	window_stack_push(s_main_window, true);
}

static void deinit() {
	window_destroy(s_main_window);
}

int main(void) {
	simply = simply_init();
//	init();
	app_event_loop();
	deinit();
	simply_deinit(simply);
}
