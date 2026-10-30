package cn.wujiacun.legends;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.io.IOException;

public class MainActivity extends Activity {
    private static final String ORIGIN = "https://appassets.androidplatform.net/";
    private static final int LAUNCH_BACKGROUND = 0xff050308;
    private final Handler launchHandler = new Handler(Looper.getMainLooper());
    private WebView game;
    private View launchView;
    private boolean gameRevealed;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        immersive();
        if (android.os.Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams params = getWindow().getAttributes();
            params.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(params);
        }

        FrameLayout stage = new FrameLayout(this);
        stage.setBackgroundColor(LAUNCH_BACKGROUND);
        game = new WebView(this);
        game.setBackgroundColor(LAUNCH_BACKGROUND);
        game.setAlpha(0f);
        game.getSettings().setJavaScriptEnabled(true);
        game.getSettings().setDomStorageEnabled(true);
        game.getSettings().setTextZoom(100);
        game.getSettings().setUseWideViewPort(true);
        game.getSettings().setLoadWithOverviewMode(true);
        game.getSettings().setAllowFileAccess(false);
        game.getSettings().setAllowContentAccess(false);
        game.getSettings().setMediaPlaybackRequiresUserGesture(true);
        game.addJavascriptInterface(new BootBridge(), "WujiaAndroid");
        game.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (!url.startsWith(ORIGIN) || gameRevealed) return;
                view.evaluateJavascript(
                    "(()=>{const a=window.WUJIA_ART||{},sources=[a.background,a.character].filter(Boolean);" +
                    "let left=sources.length,done=false;const ready=()=>{if(done)return;done=true;" +
                    "requestAnimationFrame(()=>requestAnimationFrame(()=>window.WujiaAndroid.ready()))};" +
                    "if(!left){ready();return}const settled=()=>{if(--left<=0)ready()};" +
                    "sources.forEach(src=>{const image=new Image();let ended=false;" +
                    "const finish=()=>{if(ended)return;ended=true;settled()};" +
                    "image.onload=finish;image.onerror=finish;image.src=src;" +
                    "if(image.complete)finish();setTimeout(finish,2800)});})()", null);
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (!"https".equals(uri.getScheme()) || !"appassets.androidplatform.net".equals(uri.getHost())) return emptyResponse();
                String name = uri.getPath();
                if (name == null || name.contains("..")) return emptyResponse();
                name = name.substring(1);
                try { return new WebResourceResponse(mimeType(name), "UTF-8", getAssets().open(name)); }
                catch (IOException e) { return emptyResponse(); }
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("appassets.androidplatform.net".equals(uri.getHost())) return false;
                if ("https".equals(uri.getScheme())) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
                    catch (android.content.ActivityNotFoundException ignored) {}
                }
                return true;
            }
        });

        stage.addView(game, new FrameLayout.LayoutParams(-1, -1));
        launchView = createLaunchView();
        stage.addView(launchView, new FrameLayout.LayoutParams(-1, -1));
        setContentView(stage);
        game.loadUrl(ORIGIN + "index.html");

        // Safety net only. Normal startup is released by WujiaBoot after critical assets settle.
        launchHandler.postDelayed(this::recoverFromStalledStartup, 8000);
    }

    private View createLaunchView() {
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(LAUNCH_BACKGROUND);
        LinearLayout copy = new LinearLayout(this);
        copy.setOrientation(LinearLayout.VERTICAL);
        copy.setGravity(Gravity.CENTER);

        TextView title = new TextView(this);
        title.setText("吴家村传说");
        title.setTextColor(Color.rgb(232, 220, 198));
        title.setTextSize(34);
        title.setLetterSpacing(0.12f);
        title.setGravity(Gravity.CENTER);
        title.setShadowLayer(dp(22), 0, 0, 0x889b231c);

        TextView subtitle = new TextView(this);
        subtitle.setText("血 债 神 兵");
        subtitle.setTextColor(Color.rgb(157, 54, 43));
        subtitle.setTextSize(15);
        subtitle.setLetterSpacing(0.24f);
        subtitle.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams subParams = new LinearLayout.LayoutParams(-2, -2);
        subParams.topMargin = dp(10);

        copy.addView(title, new LinearLayout.LayoutParams(-2, -2));
        copy.addView(subtitle, subParams);
        root.addView(copy, new FrameLayout.LayoutParams(-1, -1));
        return root;
    }

    private int dp(int value) { return Math.round(value * getResources().getDisplayMetrics().density); }
    private WebResourceResponse emptyResponse() {
        return new WebResourceResponse("text/plain", "UTF-8", new java.io.ByteArrayInputStream(new byte[0]));
    }
    private String mimeType(String name) {
        if (name.endsWith(".js")) return "application/javascript";
        if (name.endsWith(".css")) return "text/css";
        if (name.endsWith(".png")) return "image/png";
        if (name.endsWith(".webp")) return "image/webp";
        if (name.endsWith(".svg")) return "image/svg+xml";
        if (name.endsWith(".json")) return "application/json";
        if (name.endsWith(".mp3")) return "audio/mpeg";
        return "text/html";
    }

    private final class BootBridge {
        @JavascriptInterface public void ready() { runOnUiThread(() -> revealGame(false)); }
    }

    private void recoverFromStalledStartup() {
        if (gameRevealed || game == null) return;
        game.evaluateJavascript("window.WujiaBoot&&window.WujiaBoot.recover&&window.WujiaBoot.recover()", value -> revealGame(true));
    }

    private void revealGame(boolean recovered) {
        if (gameRevealed || game == null || launchView == null) return;
        gameRevealed = true;
        launchHandler.removeCallbacksAndMessages(null);
        game.setAlpha(1f);
        launchView.animate().cancel();
        launchView.animate().alpha(0f).setDuration(recovered ? 100 : 240).setListener(new AnimatorListenerAdapter() {
            @Override public void onAnimationEnd(Animator animation) {
                if (launchView != null && launchView.getParent() instanceof FrameLayout)
                    ((FrameLayout) launchView.getParent()).removeView(launchView);
                launchView = null;
            }
        }).start();
    }

    private void immersive() {
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }
    @Override public void onWindowFocusChanged(boolean focus) { super.onWindowFocusChanged(focus); if (focus) immersive(); }
    @Override protected void onPause() { super.onPause(); if (game != null) { game.evaluateJavascript("keys={};", null); game.onPause(); game.pauseTimers(); } }
    @Override protected void onResume() { super.onResume(); if (game != null) { game.onResume(); game.resumeTimers(); } }
    @Override public void onBackPressed() {
        new AlertDialog.Builder(this).setTitle("返回现实世界？").setMessage("已完成章节会自动保存在本机。")
            .setPositiveButton("退出游戏", (d,w)->finish()).setNegativeButton("继续奇遇", (d,w)->immersive()).show();
    }
    @Override protected void onDestroy() {
        launchHandler.removeCallbacksAndMessages(null);
        if (game != null) { game.removeJavascriptInterface("WujiaAndroid"); game.destroy(); }
        super.onDestroy();
    }
}
