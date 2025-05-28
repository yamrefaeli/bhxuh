
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Save,
  Upload,
  Download,
  Type,
  Palette,
  Minus,
  Plus,
  List,
  ListOrdered,
  Undo,
  Redo,
  Search,
  FileText,
  Copy,
  Cut,
  Clipboard,
  Printer,
  Image as ImageIcon,
  Link,
  Table,
  MoreHorizontal
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const Index = () => {
  const [content, setContent] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('David');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [lineHeight, setLineHeight] = useState(1.6);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // אותיות ניקוד נפוצות מורחבות
  const nikudSymbols = [
    { name: 'קמץ', symbol: '\u05B8' },
    { name: 'פתח', symbol: '\u05B7' },
    { name: 'צירה', symbol: '\u05B5' },
    { name: 'סגול', symbol: '\u05B6' },
    { name: 'חיריק', symbol: '\u05B4' },
    { name: 'חולם', symbol: '\u05B9' },
    { name: 'שורוק', symbol: '\u05BC' },
    { name: 'קובוץ', symbol: '\u05BB' },
    { name: 'שבא', symbol: '\u05B0' },
    { name: 'דגש', symbol: '\u05BC' },
    { name: 'רפה', symbol: '\u05BF' },
    { name: 'חטף פתח', symbol: '\u05B2' },
    { name: 'חטף קמץ', symbol: '\u05B3' },
    { name: 'חטף סגול', symbol: '\u05B1' },
    { name: 'מתג', symbol: '\u05BD' },
    { name: 'מקף', symbol: '\u05BE' },
  ];

  // סימני טעמים
  const teamimSymbols = [
    { name: 'אתנחתא', symbol: '\u0591' },
    { name: 'סגול', symbol: '\u0592' },
    { name: 'שלשלת', symbol: '\u0593' },
    { name: 'זקף קטן', symbol: '\u0594' },
    { name: 'זקף גדול', symbol: '\u0595' },
    { name: 'טפחא', symbol: '\u0596' },
    { name: 'רביע', symbol: '\u0597' },
    { name: 'זרקא', symbol: '\u0598' },
    { name: 'פשטא', symbol: '\u0599' },
    { name: 'יתיב', symbol: '\u059A' },
    { name: 'תביר', symbol: '\u059B' },
    { name: 'גרש', symbol: '\u059C' },
    { name: 'גרשיים', symbol: '\u059D' },
    { name: 'גרש מוקדם', symbol: '\u059E' },
    { name: 'סוף פסוק', symbol: '\u05C3' },
  ];

  // פונקציות עיצוב מתקדמות
  const execCommand = (command: string, value?: string) => {
    if (editorRef.current) {
      saveToUndoStack();
      document.execCommand(command, false, value);
      editorRef.current.focus();
      updateContent();
    }
  };

  const saveToUndoStack = () => {
    if (editorRef.current) {
      setUndoStack(prev => [...prev.slice(-19), editorRef.current!.innerHTML]);
      setRedoStack([]);
    }
  };

  const undo = () => {
    if (undoStack.length > 0 && editorRef.current) {
      const lastState = undoStack[undoStack.length - 1];
      setRedoStack(prev => [editorRef.current!.innerHTML, ...prev.slice(0, 19)]);
      setUndoStack(prev => prev.slice(0, -1));
      editorRef.current.innerHTML = lastState;
      updateContent();
    }
  };

  const redo = () => {
    if (redoStack.length > 0 && editorRef.current) {
      const nextState = redoStack[0];
      setUndoStack(prev => [...prev.slice(-19), editorRef.current!.innerHTML]);
      setRedoStack(prev => prev.slice(1));
      editorRef.current.innerHTML = nextState;
      updateContent();
    }
  };

  const updateContent = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContent(html);
      
      // חישוב מילים ותווים
      const text = editorRef.current.innerText || '';
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars = text.length;
      setWordCount(words);
      setCharCount(chars);
    }
  };

  const insertNikud = (symbol: string) => {
    if (editorRef.current) {
      saveToUndoStack();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const textNode = document.createTextNode(symbol);
        range.insertNode(textNode);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      updateContent();
    }
  };

  const insertTable = () => {
    if (editorRef.current) {
      saveToUndoStack();
      let tableHtml = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
      for (let i = 0; i < tableRows; i++) {
        tableHtml += '<tr>';
        for (let j = 0; j < tableCols; j++) {
          tableHtml += '<td style="padding: 8px; border: 1px solid #ccc;">&nbsp;</td>';
        }
        tableHtml += '</tr>';
      }
      tableHtml += '</table>';
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const div = document.createElement('div');
        div.innerHTML = tableHtml;
        range.insertNode(div.firstChild!);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      updateContent();
      setShowTableDialog(false);
    }
  };

  const insertImage = () => {
    const url = prompt('הכנס קישור לתמונה:');
    if (url && editorRef.current) {
      saveToUndoStack();
      execCommand('insertImage', url);
    }
  };

  const insertLink = () => {
    const url = prompt('הכנס קישור:');
    if (url && editorRef.current) {
      saveToUndoStack();
      execCommand('createLink', url);
    }
  };

  const findAndReplace = () => {
    if (searchTerm && editorRef.current) {
      const content = editorRef.current.innerHTML;
      const newContent = content.replace(new RegExp(searchTerm, 'g'), replaceTerm);
      editorRef.current.innerHTML = newContent;
      updateContent();
      setSearchTerm('');
      setReplaceTerm('');
    }
  };

  const handleSave = () => {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'מסמך-תורני.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>הדפסה</title>
            <style>
              body { font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (editorRef.current) {
          saveToUndoStack();
          editorRef.current.innerHTML = text;
          setContent(text);
          updateContent();
        }
      };
      reader.readAsText(file);
    }
  };

  const copyToClipboard = () => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.toString()) {
        navigator.clipboard.writeText(selection.toString());
      }
    }
  };

  const cutToClipboard = () => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.toString()) {
        navigator.clipboard.writeText(selection.toString());
        saveToUndoStack();
        execCommand('delete');
      }
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && editorRef.current) {
        saveToUndoStack();
        execCommand('insertText', text);
      }
    } catch (err) {
      console.log('לא ניתן להדביק מהלוח');
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.fontSize = `${fontSize}px`;
      editorRef.current.style.fontFamily = fontFamily;
      editorRef.current.style.color = textColor;
      editorRef.current.style.backgroundColor = backgroundColor;
      editorRef.current.style.lineHeight = lineHeight.toString();
    }
  }, [fontSize, fontFamily, textColor, backgroundColor, lineHeight]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              redo();
            } else {
              e.preventDefault();
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'p':
            e.preventDefault();
            handlePrint();
            break;
          case 'f':
            e.preventDefault();
            setShowSearch(true);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* כותרת */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">עורך הטקסטים התורני המתקדם</h1>
          <p className="text-gray-600">כלי מקצועי לכתיבה ועיצוב טקסטים תורניים עם תמיכה מלאה בניקוד וטעמים</p>
        </div>

        {/* סרגל כלים עליון - קובץ ועריכה */}
        <Card className="p-4 mb-4">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            {/* כלי קובץ */}
            <div className="flex gap-2 items-center">
              <Button onClick={() => fileInputRef.current?.click()} size="sm" variant="outline">
                <Upload className="w-4 h-4 ml-1" />
                פתח
              </Button>
              <Button onClick={handleSave} size="sm" variant="outline">
                <Save className="w-4 h-4 ml-1" />
                שמור
              </Button>
              <Button onClick={handlePrint} size="sm" variant="outline">
                <Printer className="w-4 h-4 ml-1" />
                הדפס
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.txt"
                onChange={handleFileLoad}
                className="hidden"
              />
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* כלי עריכה */}
            <div className="flex gap-2 items-center">
              <Button onClick={undo} size="sm" variant="outline" disabled={undoStack.length === 0}>
                <Undo className="w-4 h-4" />
              </Button>
              <Button onClick={redo} size="sm" variant="outline" disabled={redoStack.length === 0}>
                <Redo className="w-4 h-4" />
              </Button>
              <Button onClick={copyToClipboard} size="sm" variant="outline">
                <Copy className="w-4 h-4" />
              </Button>
              <Button onClick={cutToClipboard} size="sm" variant="outline">
                <Cut className="w-4 h-4" />
              </Button>
              <Button onClick={pasteFromClipboard} size="sm" variant="outline">
                <Clipboard className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* חיפוש */}
            <div className="flex gap-2 items-center">
              <Button onClick={() => setShowSearch(!showSearch)} size="sm" variant="outline">
                <Search className="w-4 h-4 ml-1" />
                חיפוש
              </Button>
            </div>
          </div>
        </Card>

        {/* סרגל חיפוש */}
        {showSearch && (
          <Card className="p-4 mb-4">
            <div className="flex gap-2 items-center">
              <Input
                ref={searchInputRef}
                placeholder="חפש..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-40"
              />
              <Input
                placeholder="החלף ב..."
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                className="w-40"
              />
              <Button onClick={findAndReplace} size="sm">
                החלף
              </Button>
              <Button onClick={() => setShowSearch(false)} size="sm" variant="outline">
                סגור
              </Button>
            </div>
          </Card>
        )}

        {/* סרגל כלים עיצוב */}
        <Card className="p-4 mb-4">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            {/* כלי עיצוב טקסט */}
            <div className="flex gap-2 items-center">
              <Button onClick={() => execCommand('bold')} size="sm" variant="outline">
                <Bold className="w-4 h-4" />
              </Button>
              <Button onClick={() => execCommand('italic')} size="sm" variant="outline">
                <Italic className="w-4 h-4" />
              </Button>
              <Button onClick={() => execCommand('underline')} size="sm" variant="outline">
                <Underline className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* רשימות */}
            <div className="flex gap-2 items-center">
              <Button onClick={() => execCommand('insertUnorderedList')} size="sm" variant="outline">
                <List className="w-4 h-4" />
              </Button>
              <Button onClick={() => execCommand('insertOrderedList')} size="sm" variant="outline">
                <ListOrdered className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* יישור */}
            <div className="flex gap-2 items-center">
              <Button onClick={() => execCommand('justifyRight')} size="sm" variant="outline">
                <AlignRight className="w-4 h-4" />
              </Button>
              <Button onClick={() => execCommand('justifyCenter')} size="sm" variant="outline">
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button onClick={() => execCommand('justifyLeft')} size="sm" variant="outline">
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button onClick={() => execCommand('justifyFull')} size="sm" variant="outline">
                <AlignJustify className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* הוספות */}
            <div className="flex gap-2 items-center">
              <Button onClick={insertImage} size="sm" variant="outline">
                <ImageIcon className="w-4 h-4 ml-1" />
                תמונה
              </Button>
              <Button onClick={insertLink} size="sm" variant="outline">
                <Link className="w-4 h-4 ml-1" />
                קישור
              </Button>
              <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Table className="w-4 h-4 ml-1" />
                    טבלה
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>הוסף טבלה</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>שורות</Label>
                      <Input
                        type="number"
                        value={tableRows}
                        onChange={(e) => setTableRows(Number(e.target.value))}
                        min="1"
                        max="20"
                      />
                    </div>
                    <div>
                      <Label>עמודות</Label>
                      <Input
                        type="number"
                        value={tableCols}
                        onChange={(e) => setTableCols(Number(e.target.value))}
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>
                  <Button onClick={insertTable} className="mt-4">
                    הוסף טבלה
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>

        {/* סרגל הגדרות מתקדם */}
        <Card className="p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 items-end">
            {/* גופן */}
            <div>
              <Label className="text-sm font-medium">גופן</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="David">דוד</SelectItem>
                  <SelectItem value="Narkisim">נרקיסים</SelectItem>
                  <SelectItem value="Frank Ruehl CLM">פרנק רוהל</SelectItem>
                  <SelectItem value="Ezra SIL">עזרא</SelectItem>
                  <SelectItem value="Tahoma">תהומה</SelectItem>
                  <SelectItem value="Times New Roman">טיימס</SelectItem>
                  <SelectItem value="Arial">אריאל</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* גודל גופן */}
            <div>
              <Label className="text-sm font-medium">גודל</Label>
              <div className="flex gap-1">
                <Button
                  onClick={() => setFontSize(Math.max(8, fontSize - 2))}
                  size="sm"
                  variant="outline"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-16 text-center"
                  min="8"
                  max="72"
                />
                <Button
                  onClick={() => setFontSize(Math.min(72, fontSize + 2))}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* ריווח שורות */}
            <div>
              <Label className="text-sm font-medium">ריווח שורות</Label>
              <Select value={lineHeight.toString()} onValueChange={(value) => setLineHeight(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1.0</SelectItem>
                  <SelectItem value="1.2">1.2</SelectItem>
                  <SelectItem value="1.4">1.4</SelectItem>
                  <SelectItem value="1.6">1.6</SelectItem>
                  <SelectItem value="1.8">1.8</SelectItem>
                  <SelectItem value="2">2.0</SelectItem>
                  <SelectItem value="2.5">2.5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* צבע טקסט */}
            <div>
              <Label className="text-sm font-medium">צבע טקסט</Label>
              <div className="flex gap-1">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 rounded border"
                />
                <Button
                  onClick={() => execCommand('foreColor', textColor)}
                  size="sm"
                  variant="outline"
                >
                  <Palette className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* צבע רקע */}
            <div>
              <Label className="text-sm font-medium">רקע טקסט</Label>
              <div className="flex gap-1">
                <input
                  type="color"
                  value="#ffff00"
                  onChange={(e) => execCommand('hiliteColor', e.target.value)}
                  className="w-8 h-8 rounded border"
                />
                <Button
                  onClick={() => execCommand('hiliteColor', '#ffff00')}
                  size="sm"
                  variant="outline"
                >
                  <Palette className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* צבע רקע עמוד */}
            <div>
              <Label className="text-sm font-medium">רקע עמוד</Label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-8 h-8 rounded border"
              />
            </div>

            {/* סטטיסטיקות */}
            <div>
              <Label className="text-sm font-medium">סטטיסטיקות</Label>
              <div className="text-xs text-gray-600">
                <div>מילים: {wordCount}</div>
                <div>תווים: {charCount}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* סרגל ניקוד מורחב */}
        <Card className="p-4 mb-4">
          <div className="mb-2">
            <Label className="text-sm font-medium">ניקוד</Label>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {nikudSymbols.map((nikud) => (
              <Button
                key={nikud.name}
                onClick={() => insertNikud(nikud.symbol)}
                size="sm"
                variant="outline"
                className="text-lg"
                title={nikud.name}
              >
                א{nikud.symbol}
              </Button>
            ))}
          </div>
          
          <div className="mb-2">
            <Label className="text-sm font-medium">טעמים</Label>
          </div>
          <div className="flex flex-wrap gap-2">
            {teamimSymbols.map((team) => (
              <Button
                key={team.name}
                onClick={() => insertNikud(team.symbol)}
                size="sm"
                variant="outline"
                className="text-lg"
                title={team.name}
              >
                א{team.symbol}
              </Button>
            ))}
          </div>
        </Card>

        {/* אזור העריכה */}
        <Card className="p-0 border-2 border-gray-200">
          <div
            ref={editorRef}
            contentEditable
            onInput={updateContent}
            className="min-h-[700px] p-6 outline-none focus:bg-white transition-colors"
            style={{
              fontSize: `${fontSize}px`,
              fontFamily: fontFamily,
              color: textColor,
              backgroundColor: backgroundColor,
              lineHeight: lineHeight,
            }}
            suppressContentEditableWarning={true}
          >
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-4">ברוכים הבאים לעורך הטקסטים התורני המתקדם</h2>
              <p className="text-lg text-gray-700 mb-4">
                כלי עיצוב מקצועי לטקסטים תורניים עם תמיכה מלאה בניקוד, טעמים ופונקציות מתקדמות
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b-2 border-blue-500 pb-2">תכונות מתקדמות</h3>
              
              <ul className="list-disc list-inside space-y-2 text-gray-800">
                <li>עיצוב טקסט מלא: <strong>מודגש</strong>, <em>נטוי</em>, <u>קו תחתון</u></li>
                <li>ניקוד וטעמים מלאים לטקסטים תורניים</li>
                <li>הוספת טבלאות, תמונות וקישורים</li>
                <li>חיפוש והחלפת טקסט מתקדם</li>
                <li>ביטול וחזרה על פעולות (Undo/Redo)</li>
                <li>העתקה, גזירה והדבקה</li>
                <li>שמירה והדפסה מתקדמת</li>
                <li>ספירת מילים ותווים בזמן אמת</li>
              </ul>

              <h3 className="text-xl font-semibold border-b-2 border-green-500 pb-2">דוגמת טקסט מנוקד</h3>
              <p className="text-lg leading-relaxed">
                בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃ וְהָאָ֗רֶץ הָיְתָ֥ה תֹ֙הוּ֙ וָבֹ֔הוּ 
                וְחֹ֖שֶׁךְ עַל־פְּנֵ֣י תְה֑וֹם וְר֣וּחַ אֱלֹהִ֔ים מְרַחֶ֖פֶת עַל־פְּנֵ֥י הַמָּֽיִם׃
              </p>

              <h3 className="text-xl font-semibold border-b-2 border-purple-500 pb-2">טבלת דוגמה</h3>
              <table className="w-full border-collapse border border-gray-400 mt-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 p-3 text-right">מקור</th>
                    <th className="border border-gray-400 p-3 text-right">פירוש</th>
                    <th className="border border-gray-400 p-3 text-right">הערות</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-3">בראשית א:א</td>
                    <td className="border border-gray-400 p-3">תחילת הבריאה</td>
                    <td className="border border-gray-400 p-3">פסוק ראשון בתורה</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-3">בראשית א:ב</td>
                    <td className="border border-gray-400 p-3">מצב הארץ לפני הבריאה</td>
                    <td className="border border-gray-400 p-3">תיאור הכאוס הראשוני</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">הוראות שימוש:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• השתמש בכלי העיצוב העליונים לעיצוב הטקסט</li>
                  <li>• לחץ על כפתורי הניקוד והטעמים להוסיפם לטקסט</li>
                  <li>• השתמש ב-Ctrl+Z לביטול ו-Ctrl+Y לחזרה</li>
                  <li>• לחץ F למציאת טקסט ו-Ctrl+S לשמירה</li>
                  <li>• הוסף טבלאות, תמונות וקישורים מהסרגל העליון</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* מידע תחתון */}
        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
          <p>
            <strong>עורך טקסטים תורני מתקדם</strong> - כלי מקצועי לכתיבה ועיצוב טקסטים תורניים
          </p>
          <p>
            תומך בכל פונקציות העיצוב המתקדמות, ניקוד מלא, טעמים, טבלאות ועוד
          </p>
          <div className="flex justify-center space-x-4 text-xs">
            <span>מילים: {wordCount}</span>
            <span>•</span>
            <span>תווים: {charCount}</span>
            <span>•</span>
            <span>גופן: {fontFamily}</span>
            <span>•</span>
            <span>גודל: {fontSize}px</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
